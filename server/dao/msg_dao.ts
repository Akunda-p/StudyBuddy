import { Msg } from "../schema/msg_schema";


export async function retriveMsg(userID: string, friendID: string) {
    return await Msg.find().or([{ sender: userID, receiver: friendID }, { sender: friendID, receiver: userID }])
}

export async function addMsg(sender: string, receiver: string, senderName: string, senderPic: string, msg: string, sendTime: Date) {
    const newMsg = new Msg({ sender: sender, receiver: receiver, senderName: senderName, senderPic: senderPic, msg, sendTime: sendTime })
    return await newMsg.save()
}