import { useAuth0 } from "@auth0/auth0-react";
import { ChangeEvent, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import React from "react";
import TextField from '@mui/material/TextField';
import { Avatar, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import dayjs from "dayjs";
import { socket } from "../view/SandBox";
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import { wait } from "@testing-library/user-event/dist/utils";

export interface IMsg {
    sender: string,
    receiver: string,
    senderName: string,
    senderPic: string,
    sendTime: Date,
    msg: string
}

export interface IPayload {
    friendID: string,
    msg: string
}

export default function Chat() {

    const { getAccessTokenSilently } = useAuth0()
    const location = useLocation()
    const [friendStatus, setFriendStatus] = React.useState<boolean>(false)
    const [msgs, setMsgs] = React.useState<IMsg[]>([])
    const [msg, setMsg] = React.useState<string>()
    const [friendName, setFriendName] = React.useState<string>()
    const [isLoading, setIsLoading] = React.useState<boolean>(true)
    const [result, setResult] = React.useState<number>(1)
    const [hasMore, setHasMore] = React.useState<string>("none")
    const [scrollHeight, setScrollHeight] = React.useState<number>()
    const navigate = useNavigate()

    useEffect(() => {
        async function getChat() {
            const token = await getAccessTokenSilently()
            const friendID = location.state.id

            socket.on("notFriends", () => {
                setFriendStatus(false)
                setIsLoading(false)
            })
            socket.on("friends", (msgs, friendName, hasMore) => {
                setFriendStatus(true)
                setMsgs(msgs)
                setFriendName(friendName)
                setIsLoading(false)
                setHasMore(hasMore)
                setTimeout(() => {
                    setResult((result) => {
                        if (result == 1) {
                            scrollToBottom()
                            const msgBox = document.getElementById("msgBox")
                            setScrollHeight(msgBox?.scrollHeight)
                        } else {
                            setScrollHeight((scrollHeight) => {
                                if (scrollHeight) {
                                    console.log(scrollHeight)
                                    const msgBox = document.getElementById("msgBox")
                                    if (msgBox) {
                                        console.log(msgBox.scrollHeight)
                                    }
                                    msgBox?.scroll(0, msgBox.scrollHeight - scrollHeight)
                                    return msgBox?.scrollHeight
                                }
                            })
                        }
                        return result
                    })
                }, 100)


            })

            socket.on("newMsg", (newMsg: IMsg) => {
                setResult((result) => {
                    setMsgs((msgs) => {
                        if (msgs.length == result * 15) {
                            setHasMore("more")
                            const msgBox = document.getElementById("msgBox")
                            setScrollHeight(msgBox?.scrollHeight)
                            const newMsgs = [...msgs]
                            newMsgs.shift()
                            return [...newMsgs, newMsg]
                        } else {
                            const msgBox = document.getElementById("msgBox")
                            setScrollHeight(msgBox?.scrollHeight)
                            return [...msgs, newMsg]
                        }
                    })
                    return result
                })
                setTimeout(() => {
                    scrollToBottom()
                }, 50)
            })

            socket.emit("startChat", friendID, result)
        }
        getChat()
        return (
            () => {
                socket.off("notFriends")
                socket.off("friends")
                socket.off("newMsg")
                socket.emit("leaveChat")
            }

        )
    }, [])

    const handleMsg = (event: ChangeEvent<HTMLInputElement>) => {
        setMsg(event.target.value)
    }

    const handleSend = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            if (msg) {
                const payload = {
                    friendID: location.state.id,
                    msg: msg
                }
                socket.emit("sendMsg", payload)
                setMsg("")
            }
        }
    }

    const scrollToBottom = () => {
        const msgBox = document.getElementById("msgBox")
        msgBox?.scroll(0, msgBox.scrollHeight)


    }

    const handleProfile = (sender: string) => {
        navigate("/frienddetail/", { state: { "id": sender } })
    }

    function handleReturn() {
        navigate(-1)
    }

    const handleLoadMore = () => {
        const friendID = location.state.id
        socket.emit("startChat", friendID, result + 1)
        setResult((result) => result + 1)
    }

    return (
        <div style={{ height: "100%" }}>
            {isLoading ? <div style={{ textAlign: "center" }}><CircularProgress size={150} style={{ marginTop: "40vh" }} /></div> :
                (friendStatus ?
                    // <div>
                    //     <TextField
                    //             id="msg"
                    //             onChange={handleMsg}
                    //             onKeyDown={handleSend}
                    //             fullWidth
                    //         />
                    // </div> 
                    <div>
                        <Button variant="contained"
                            sx={{ width: 100 }}
                            onClick={handleReturn}
                        >
                            &lt;back
                        </Button>
                        <div style={{ textAlign: "center" }}>
                            <h1 style={{ cursor: "pointer" }} onClick={() => handleProfile(location.state.id)}>
                                {friendName}
                            </h1>
                        </div>
                        <Paper elevation={24}>
                            <div id="msgBox" style={{ height: "70vh", overflow: "scroll", padding: 20 }}>
                                {hasMore == "more" &&
                                    <div style={{ textAlign: "center" }}>
                                        <Button variant="contained"
                                            sx={{ width: 150 }}
                                            onClick={handleLoadMore}
                                        >
                                            Load more
                                        </Button>
                                    </div>}
                                {msgs?.map((msg) => (
                                    <div>
                                        <div style={{ display: "flex" }}>
                                            <div>
                                                <Avatar src={msg.senderPic} onClick={() => handleProfile(msg.sender)} style={{ cursor: "pointer" }} />
                                            </div>
                                            <div style={{ marginTop: "5px", marginLeft: "10px" }}>
                                                <b style={{ fontSize: "20px", cursor: "pointer" }} onClick={() => handleProfile(msg.sender)}>{msg.senderName}</b>
                                            </div>
                                            <div style={{ marginTop: "10px", marginLeft: "10px" }}>
                                                <small style={{ color: "gray" }}>{dayjs(msg.sendTime).format("DD/MM/YYYY HH:mm:ss")}</small>
                                            </div>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: "16px" }}>{msg.msg}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Paper>
                        <div style={{marginTop: "2vh", marginBottom: "1vh"}}>
                        <Paper elevation={24} sx={{padding: "1em"}}>
                        <TextField
                            id="msg"
                            onChange={handleMsg}
                            onKeyDown={handleSend}
                            value={msg}
                            label="Type Message Here"
                            fullWidth
                            sx={{ borderRadius: 1, border: 1}}
                        />
                        </Paper>
                        </div>
                    </div>
                    : <div><Button variant="contained"
                        sx={{ width: 100 }}
                        onClick={handleReturn}
                    >
                        &lt;back
                    </Button>You're not friends yet</div>)
            }
        </div>

    )




}