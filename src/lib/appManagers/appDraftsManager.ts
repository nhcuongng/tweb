import { MOUNT_CLASS_TO } from "../mtproto/mtproto_config";
import rootScope from "../rootScope";
import appPeersManager from "./appPeersManager";
import appMessagesManager from "./appMessagesManager";
import apiUpdatesManager from "./apiUpdatesManager";
import RichTextProcessor from "../richtextprocessor";
import serverTimeManager from "../mtproto/serverTimeManager";
import { MessageEntity, DraftMessage, MessagesSaveDraft } from "../../layer";
import apiManager from "../mtproto/mtprotoworker";
import { tsNow } from "../../helpers/date";
import { deepEqual } from "../../helpers/object";
import appStateManager from "./appStateManager";
import { isObject } from "../mtproto/bin_utils";

export type MyDraftMessage = DraftMessage.draftMessage;

export class AppDraftsManager {
  private drafts: {[peerIdAndThreadId: string]: MyDraftMessage} = {};
  private getAllDraftPromise: Promise<void> = null;

  constructor() {
    appStateManager.getState().then(state => {
      this.drafts = state.drafts;
    });

    appStateManager.addListener('save', async() => {
      appStateManager.pushToState('drafts', this.drafts);
    });

    rootScope.on('apiUpdate', (update) => {
      if(update._ !== 'updateDraftMessage') {
        return
      }

      const peerID = appPeersManager.getPeerId(update.peer);
      this.saveDraft(peerID, (update as any).threadId, update.draft, {notify: true});
    });
  }

  private getKey(peerId: number, threadId?: number) {
    return '' + peerId + (threadId ? '_' + threadId : '');
  }

  public getDraft(peerId: number, threadId?: number) {
    return this.drafts[this.getKey(peerId, threadId)];
  }

  public addMissedDialogs() {
    return this.getAllDrafts().then(() => {
      for(const key in this.drafts) {
        if(key.indexOf('_') !== -1) { // exclude threads
          continue;
        }

        const peerId = +key;
        const dialog = appMessagesManager.getDialogByPeerId(peerId)[0];
        if(!dialog) {
          appMessagesManager.reloadConversation(peerId);
          /* const dialog = appMessagesManager.generateDialog(peerId);
          dialog.draft = this.drafts[key];
          appMessagesManager.saveConversation(dialog);
          appMessagesManager.newDialogsToHandle[peerId] = dialog;
          appMessagesManager.scheduleHandleNewDialogs(); */
        }
      }
    });
  }

  public getAllDrafts() {
    return this.getAllDraftPromise || (this.getAllDraftPromise = new Promise((resolve) => {
      apiManager.invokeApi('messages.getAllDrafts').then((updates) => {
        apiUpdatesManager.processUpdateMessage(updates, {ignoreSyncLoading: true});
        resolve();
      });
    }));
  }

  public saveDraft(peerId: number, threadId: number, apiDraft: DraftMessage, options: Partial<{
    notify: boolean
  }> = {}) {
    const draft = this.processApiDraft(apiDraft);

    const key = this.getKey(peerId, threadId);
    if(draft) {
      this.drafts[key] = draft;
    } else {
      delete this.drafts[key];
    }

    if(options.notify) {
      // console.warn(dT(), 'save draft', peerId, apiDraft, options)
      rootScope.broadcast('draft_updated', {
        peerId,
        threadId,
        draft
      });
    }

    return draft;
  }

  public draftsAreEqual(draft1: DraftMessage, draft2: DraftMessage) {
    if(typeof(draft1) !== typeof(draft2)) {
      return false;
    }

    if(!isObject(draft1)) {
      return true;
    }

    if(draft1._ !== draft2._) {
      return false;
    }
  
    if(draft1._ === 'draftMessage' && draft2._ === draft1._) {
      if(draft1.reply_to_msg_id !== draft2.reply_to_msg_id) {
        return false;
      }
  
      if(!deepEqual(draft1.entities, draft2.entities)) {
        return false;
      }
  
      if(draft1.message !== draft2.message) {
        return false;
      }
  
      if(draft1.pFlags.no_webpage !== draft2.pFlags.no_webpage) {
        return false;
      }
    }

    return true;
  }

  public isEmptyDraft(draft: DraftMessage) {
    if(!draft || draft._ === 'draftMessageEmpty') {
      return true;
    }
    
    if(draft.reply_to_msg_id > 0) {
      return false;
    }
    
    if(!draft.message.length) {
      return true;
    }
    
    return false;
  }

  public processApiDraft(draft: DraftMessage): MyDraftMessage {
    if(!draft || draft._ !== 'draftMessage') {
      return undefined;
    }

    const myEntities = RichTextProcessor.parseEntities(draft.message);
    const apiEntities = draft.entities || [];
    const totalEntities = RichTextProcessor.mergeEntities(apiEntities, myEntities); // ! only in this order, otherwise bold and emoji formatting won't work

    draft.rMessage = RichTextProcessor.wrapDraftText(draft.message, {entities: totalEntities});
    draft.rReply = appMessagesManager.getRichReplyText(draft);
    if(draft.reply_to_msg_id) {
      draft.reply_to_msg_id = appMessagesManager.generateMessageId(draft.reply_to_msg_id);
    }

    return draft;
  }

  public async syncDraft(peerId: number, threadId: number, localDraft?: MyDraftMessage, saveOnServer = true) {
    // console.warn(dT(), 'sync draft', peerID)
    const serverDraft = this.getDraft(peerId, threadId);
    if(this.draftsAreEqual(serverDraft, localDraft)) {
      // console.warn(dT(), 'equal drafts', localDraft, serverDraft)
      return true;
    }

    // console.warn(dT(), 'changed draft', localDraft, serverDraft)
    let params: MessagesSaveDraft = {
      peer: appPeersManager.getInputPeerById(peerId),
      message: ''
    };

    let draftObj: DraftMessage;
    if(this.isEmptyDraft(localDraft)) {
      draftObj = {_: 'draftMessageEmpty'};
    } else {
      let message = localDraft.message;
      let entities: MessageEntity[] = localDraft.entities;

      if(localDraft.reply_to_msg_id) {
        params.reply_to_msg_id = appMessagesManager.getServerMessageId(localDraft.reply_to_msg_id);
      }

      if(entities?.length) {
        params.entities = entities;
      }

      if(localDraft.pFlags.no_webpage) {
        params.no_webpage = localDraft.pFlags.no_webpage;
      }

      params.message = message;
    }

    const saveLocalDraft = draftObj || localDraft;
    saveLocalDraft.date = tsNow(true) + serverTimeManager.serverTimeOffset;

    this.saveDraft(peerId, threadId, saveLocalDraft, {notify: true});

    if(saveOnServer && !threadId) {
      return apiManager.invokeApi('messages.saveDraft', params);
    }

    return true;
  }
}

const appDraftsManager = new AppDraftsManager();
MOUNT_CLASS_TO && (MOUNT_CLASS_TO.appDraftsManager = appDraftsManager);
export default appDraftsManager;