import { supabase } from './supabaseClient';

/**
 * ─── MESSAGING LOGIC (Supabase Realtime) ───
 */

/** Subscribe to direct chats for a user */
export const subscribeToDirectChats = (userId, callback) => {
    const fetchChats = async () => {
        const { data } = await supabase
            .from('chats')
            .select('*')
            .eq('type', 'direct')
            .contains('participants', [userId])
            .order('updated_at', { ascending: false });
        const mappedData = (data || []).map(c => ({
            ...c,
            participantNames: c.participant_names,
            updatedAt: c.updated_at,
            lastMessage: c.last_message,
        }));
        callback(mappedData);
    };
    fetchChats();

    const channelName = `direct_chats_${userId}_${Date.now()}_${Math.floor(Math.random()*1000)}`;
    const channel = supabase.channel(channelName)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, fetchChats)
        .subscribe();

    return () => supabase.removeChannel(channel);
};

/** Subscribe to group chats based on course codes */
export const subscribeToGroupChats = (courseCodes, callback) => {
    if (!courseCodes || courseCodes.length === 0) {
        callback([]);
        return () => {};
    }

    const fetchChats = async () => {
        const { data } = await supabase
            .from('chats')
            .select('*')
            .eq('type', 'group')
            .in('course_code', courseCodes);
        callback((data || []).map(c => ({
            ...c,
            courseCode: c.course_code,
            courseName: c.course_name,
            lastMessage: c.last_message,
            updatedAt: c.updated_at,
            participantNames: c.participant_names,
        })));
    };
    fetchChats();

    const channelName = `group_chats_${courseCodes.join('_')}_${Date.now()}_${Math.floor(Math.random()*1000)}`;
    const channel = supabase.channel(channelName)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, fetchChats)
        .subscribe();

    return () => supabase.removeChannel(channel);
};

/** Subscribe to messages within a specific chat */
export const subscribeToMessages = (chatId, callback) => {
    const fetchMessages = async () => {
        const { data } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: false })
            .limit(50);

        const msgs = (data || []).map(d => ({
            _id: d.id,
            text: d.text,
            createdAt: d.created_at ? new Date(d.created_at) : new Date(),
            status: d.status || 'sent',
            replyTo: d.reply_to || null,
            audioUrl: d.audio_url || null,
            user: {
                _id: d.sender_id,
                name: d.sender_name,
                role: d.sender_role || '',
                avatar: d.sender_avatar || null,
            }
        }));
        callback(msgs);
    };
    fetchMessages();

    const channelName = `messages_${chatId}_${Date.now()}_${Math.floor(Math.random()*1000)}`;
    const channel = supabase.channel(channelName)
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `chat_id=eq.${chatId}`
        }, fetchMessages)
        .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
            filter: `chat_id=eq.${chatId}`
        }, fetchMessages)
        .on('postgres_changes', {
            event: 'DELETE',
            schema: 'public',
            table: 'messages',
            filter: `chat_id=eq.${chatId}`
        }, fetchMessages)
        .subscribe();

    return () => supabase.removeChannel(channel);
};

/** Send a text or audio message */
export const sendMessage = async (chatId, senderId, senderName, senderRole, senderAvatar, text, replyTo = null, audioUrl = null) => {
    try {
        const msgData = {
            chat_id: chatId,
            text: text,
            sender_id: senderId,
            sender_name: senderName,
            sender_role: senderRole || '',
            sender_avatar: senderAvatar || '',
            status: 'sent',
            created_at: new Date().toISOString(),
        };
        if (replyTo) {
            msgData.reply_to = replyTo;
        }
        if (audioUrl) {
            msgData.audio_url = audioUrl;
        }

        const { error: msgError } = await supabase.from('messages').insert(msgData);
        if (msgError) throw msgError;

        // Update chat metadata
        const participantUpdate = {};
        participantUpdate[senderId] = senderName;

        const { data: existingChat } = await supabase.from('chats').select('participant_names').eq('id', chatId).single();
        const updatedNames = { ...(existingChat?.participant_names || {}), ...participantUpdate };

        const { error: chatError } = await supabase.from('chats').update({
            last_message: audioUrl ? '🎤 Voice Message' : text,
            updated_at: new Date().toISOString(),
            participant_names: updatedNames
        }).eq('id', chatId);
        if (chatError) throw chatError;

        return { success: true };
    } catch (error) {
        console.error("Error sending message:", error);
        return { success: false, error: error.message };
    }
};

/** Mark array of message IDs as seen */
export const markMessagesAsSeen = async (chatId, messageIds) => {
    if (!messageIds || messageIds.length === 0) return;
    try {
        const { error } = await supabase
            .from('messages')
            .update({ status: 'seen' })
            .in('id', messageIds);
        if (error) throw error;
    } catch (error) {
        console.error("Error marking messages as seen:", error);
    }
};

/** Start or get existing direct chat */
export const startDirectChat = async (uid1, uid2, name1, name2) => {
    if (!uid1 || !uid2) return;
    try {
        const chatId = [uid1, uid2].sort().join('_');

        const { data: existing } = await supabase.from('chats').select('id').eq('id', chatId).single();

        if (!existing) {
            const { error } = await supabase.from('chats').insert({
                id: chatId,
                type: 'direct',
                participants: [uid1, uid2],
                participant_names: { [uid1]: name1, [uid2]: name2 },
                last_message: '',
                updated_at: new Date().toISOString(),
            });
            if (error) throw error;
        }
        return { success: true, chatId: chatId };
    } catch (error) {
        console.error("Error starting direct chat:", error);
        return { success: false, error: error.message };
    }
};

/** Start or get a group chat for a subject */
export const startGroupChat = async (courseCode, courseName) => {
    if (!courseCode) return;
    try {
        const chatId = `group_${courseCode}`;

        const { data: existing } = await supabase.from('chats').select('id').eq('id', chatId).single();

        if (!existing) {
            const { error } = await supabase.from('chats').insert({
                id: chatId,
                type: 'group',
                course_code: courseCode,
                course_name: courseName,
                last_message: 'Chat room created.',
                updated_at: new Date().toISOString(),
            });
            if (error) throw error;
        }
        return { success: true, chatId: chatId };
    } catch (error) {
        console.error("Error starting group chat:", error);
        return { success: false, error: error.message };
    }
};

/** Edit a message's text */
export const editMessage = async (messageId, newText) => {
    try {
        const { error } = await supabase
            .from('messages')
            .update({ text: newText })
            .eq('id', messageId);
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Error editing message:", error);
        return { success: false, error: error.message };
    }
};

/** Delete a message */
export const deleteMessage = async (messageId, chatId) => {
    try {
        const { error } = await supabase
            .from('messages')
            .delete()
            .eq('id', messageId);
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Error deleting message:", error);
        return { success: false, error: error.message };
    }
};

/** Forward a message to another chat */
export const forwardMessage = async (targetChatId, senderId, senderName, senderRole, originalText, audioUrl = null) => {
    try {
        const fwdPrefix = '⤳ Forwarded\n';
        const text = originalText ? fwdPrefix + originalText : (audioUrl ? fwdPrefix + '🎤 Voice Message' : fwdPrefix);

        const msgData = {
            chat_id: targetChatId,
            text: text,
            sender_id: senderId,
            sender_name: senderName,
            sender_role: senderRole || '',
            sender_avatar: '',
            status: 'sent',
            created_at: new Date().toISOString(),
        };
        if (audioUrl) msgData.audio_url = audioUrl;

        const { error: msgError } = await supabase.from('messages').insert(msgData);
        if (msgError) throw msgError;

        await supabase.from('chats').update({
            last_message: audioUrl ? '⤳ 🎤 Voice Message' : (originalText ? `⤳ ${originalText.substring(0, 50)}` : '⤳ Forwarded'),
            updated_at: new Date().toISOString(),
        }).eq('id', targetChatId);

        return { success: true };
    } catch (error) {
        console.error("Error forwarding message:", error);
        return { success: false, error: error.message };
    }
};
