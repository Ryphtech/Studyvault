import { collection, doc, query, where, orderBy, onSnapshot, addDoc, setDoc, updateDoc, getDoc, getDocs, serverTimestamp, limit } from 'firebase/firestore';
import { db } from './firebaseConfig';

/**
 * ─── MESSAGING LOGIC ───
 */

/** Subscribe to direct chats for a user */
export const subscribeToDirectChats = (userId, callback) => {
    const q = query(
        collection(db, 'chats'),
        where('type', '==', 'direct'),
        where('participants', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
        const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(chats);
    }, (error) => {
        console.error("Error subscribing to direct chats:", error);
        callback([]);
    });
};

/** Subscribe to group chats based on course codes */
export const subscribeToGroupChats = (courseCodes, callback) => {
    if (!courseCodes || courseCodes.length === 0) {
        callback([]);
        return () => {};
    }
    const q = query(
        collection(db, 'chats'),
        where('type', '==', 'group'),
        where('courseCode', 'in', courseCodes)
    );
    return onSnapshot(q, (snapshot) => {
        const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(chats);
    }, (error) => {
        console.error("Error subscribing to group chats:", error);
        callback([]);
    });
};

/** Subscribe to messages within a specific chat */
export const subscribeToMessages = (chatId, callback) => {
    const q = query(
        collection(db, 'chats', chatId, 'messages'),
        orderBy('createdAt', 'desc'),
        limit(50) // Fetch latest 50 messages
    );
    return onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                _id: doc.id,
                text: data.text,
                createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
                status: data.status || 'sent',
                replyTo: data.replyTo || null,
                user: {
                    _id: data.senderId,
                    name: data.senderName,
                    role: data.senderRole || '',
                    avatar: data.senderAvatar || null,
                }
            };
        });
        callback(msgs);
    }, (error) => {
        console.error("Error subscribing to messages:", error);
        callback([]);
    });
};

/** Send a text message */
export const sendMessage = async (chatId, senderId, senderName, senderRole, senderAvatar, text, replyTo = null) => {
    try {
        const chatRef = doc(db, 'chats', chatId);
        
        // Ensure chat document exists for groups if it hasn't been created yet
        const chatSnap = await getDoc(chatRef);
        if (!chatSnap.exists()) {
            console.log("Chat doc doesn't exist, this should only happen for new group chats.");
            // Group chats should be created via startGroupChat, but we'll allow it if needed
        }

        // Add message to subcollection
        const msgData = {
            text: text,
            senderId: senderId,
            senderName: senderName,
            senderRole: senderRole || '',
            senderAvatar: senderAvatar || '',
            createdAt: serverTimestamp(),
            status: 'sent'
        };
        if (replyTo) {
            msgData.replyTo = replyTo;
        }
        await addDoc(collection(chatRef, 'messages'), msgData);

        // Update chat metadata
        await updateDoc(chatRef, {
            lastMessage: text,
            updatedAt: serverTimestamp(),
            [`participantNames.${senderId}`]: senderName
        });
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
        const promises = messageIds.map(id => 
            updateDoc(doc(db, 'chats', chatId, 'messages', id), {
                status: 'seen'
            })
        );
        await Promise.all(promises);
    } catch (error) {
        console.error("Error marking messages as seen:", error);
    }
};

/** Start or get existing direct chat */
export const startDirectChat = async (uid1, uid2, name1, name2) => {
    if (!uid1 || !uid2) return;
    try {
        const chatId = [uid1, uid2].sort().join('_');
        const chatRef = doc(db, 'chats', chatId);
        const chatSnap = await getDoc(chatRef);

        if (!chatSnap.exists()) {
            await setDoc(chatRef, {
                type: 'direct',
                participants: [uid1, uid2],
                participantNames: { [uid1]: name1, [uid2]: name2 }, // Store both names for easy UI rendering
                lastMessage: '',
                updatedAt: serverTimestamp()
            });
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
        const chatRef = doc(db, 'chats', chatId);
        const chatSnap = await getDoc(chatRef);

        if (!chatSnap.exists()) {
            await setDoc(chatRef, {
                type: 'group',
                courseCode: courseCode,
                courseName: courseName,
                lastMessage: 'Chat room created.',
                updatedAt: serverTimestamp()
            });
        }
        return { success: true, chatId: chatId };
    } catch (error) {
        console.error("Error starting group chat:", error);
        return { success: false, error: error.message };
    }
};
