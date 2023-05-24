import { Avatar, Box, Paper, Typography } from "@mui/material"
import axios from "axios"
import React from "react"
import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import Button from '@mui/material/Button';
import { useAuth0 } from "@auth0/auth0-react"
import Joi from "joi"
import { socket } from "../SandBox"
import CircularProgress from '@mui/material/CircularProgress';


export interface IFriendDetail {
    name: string
    uniID: string
    gender: string
    email: string
    faculty: string
    major: string
    userAvatar: string
}

interface IPayload {
    friendID: string
}

export default function FriendDetail() {

    const location = useLocation()
    const [friendDetail, setFriendDetail] = React.useState<IFriendDetail>()
    const [status, setStatus] = React.useState<String>()
    const navigate = useNavigate()
    const [self, setSelf] = React.useState<Boolean>()
    const { user, isAuthenticated } = useAuth0();
    const { getAccessTokenSilently } = useAuth0()
    const [isLoading, setIsLoading] = React.useState<boolean>(true)
    const payload: IPayload = {
        friendID: location.state.id
    }
    const controller = new AbortController()


    async function getFriendDetail() {
        const token = await getAccessTokenSilently()
        const dbData = await axios.get(`https://studybuddy-production.up.railway.app/friends/detail/${location.state.id}`, { signal: controller.signal, headers: { Authorization: `Bearer ${token}` } })
        const dbDataValidate = Joi.object<IFriendDetail>({
            name: Joi.string().required(),
            uniID: Joi.string().required(),
            gender: Joi.string().required().allow(null, ''),
            email: Joi.string().required().allow(null, ''),
            faculty: Joi.string().required().allow(null, ''),
            major: Joi.string().required().allow(null, ''),
            userAvatar: Joi.string().required().allow(null, '')
        }).unknown(true).validate(dbData.data)
        if (dbDataValidate.error) {
            console.error(dbDataValidate.error)
        } else {
            setFriendDetail(dbDataValidate.value)
        }
        const dbStatus: string = (await axios.post('https://studybuddy-production.up.railway.app/friends/checkStatus', payload, { signal: controller.signal, headers: { Authorization: `Bearer ${token}` } })).data
        setStatus(dbStatus)

        const dbSelf: boolean = (await axios.post(`https://studybuddy-production.up.railway.app/friends/checkself`, payload, { signal: controller.signal, headers: { Authorization: `Bearer ${token}` } })).data
        const dbSelfValidate = Joi.boolean().required().validate(dbSelf)
        if (dbSelfValidate.error) {
            console.error(dbSelfValidate.error)
        } else {
            setSelf(dbSelfValidate.value)
        }
    }

    function handleReturn() {
        navigate(-1)
    }

    async function handleUnfriend() {
        socket.emit("unFriend", location.state.id)
        setStatus("none")
    }

    async function handleSendRequest() {
        socket.emit("sendRequest", location.state.id)
        setStatus("requested")
    }

    async function handleCancelRequest() {
        socket.emit("cancelRequest", location.state.id)
        setStatus("none")
    }

    async function handleCheckRequest() {
        navigate("/notification/")
    }

    useEffect(() => {
        socket.on("statusChange", async () => {
            const token = await getAccessTokenSilently()
            const dbStatus: string = (await axios.post('https://studybuddy-production.up.railway.app/friends/checkStatus', payload, { signal: controller.signal, headers: { Authorization: `Bearer ${token}` } })).data
            setStatus(dbStatus)
        })

        getFriendDetail().finally(() => setIsLoading(false))
        return () => {
            controller.abort()
            socket.off("statusChange")
        }
    }, [])


    return (
        <div>
            {isLoading ? <div style={{ textAlign: "center" }}><CircularProgress size={150} style={{ marginTop: "40vh" }} /></div> :
                <Paper elevation={24}>
                    <Box>
                        <div style={{ width: "80%", textAlign: "center", margin: "0 auto", paddingTop: "2em", paddingBottom: "2em", wordWrap: 'break-word' }}>
                            <div>
                                <Avatar sx={{ width: 56, height: 56, margin: "0 auto" }}
                                    src={friendDetail?.userAvatar} />
                            </div>
                            <div style={{ marginBottom: "20px" }}>
                                <Typography variant="h4" gutterBottom>
                                    {friendDetail?.name}
                                </Typography>
                            </div>
                            <div style={{ textAlign: "left", marginBottom: "10px" }}>
                                <Typography variant="h6" gutterBottom>
                                    UniID: {friendDetail?.uniID}
                                </Typography>
                            </div>
                            <div style={{ textAlign: "left", marginBottom: "10px" }}>
                                {friendDetail?.gender ?
                                    <Typography variant="h6" gutterBottom>
                                        Gender: {friendDetail?.gender}
                                    </Typography>
                                    :
                                    <Typography variant="h6" gutterBottom>
                                        Gender: Prefer Not To Tell
                                    </Typography>
                                }
                            </div>
                            <div style={{ textAlign: "left", width: "100%", marginBottom: "10px" }}>
                                {friendDetail?.email ?
                                    <Typography variant="h6" gutterBottom>
                                        Email: {friendDetail?.email}
                                    </Typography>
                                    :
                                    <Typography variant="h6" gutterBottom>
                                        Email: Prefer Not To Tell
                                    </Typography>
                                }
                            </div>
                            <div style={{ textAlign: "left", marginBottom: "10px" }}>
                                {friendDetail?.faculty ?
                                    <Typography variant="h6" gutterBottom>
                                        Faculty: {friendDetail?.faculty}
                                    </Typography>
                                    :
                                    <Typography variant="h6" gutterBottom>
                                        Faculty: Prefer Not To Tell
                                    </Typography>
                                }
                            </div>
                            <div style={{ textAlign: "left", marginBottom: "10px" }}>
                                {friendDetail?.major ?
                                    <Typography variant="h6" gutterBottom>
                                        Major: {friendDetail?.major}
                                    </Typography>
                                    :
                                    <Typography variant="h6" gutterBottom>
                                        Major: Prefer Not To Tell
                                    </Typography>
                                }

                            </div>
                            <div>
                                <Button variant="contained"
                                    sx={{ width: "40%" }}
                                    onClick={handleReturn}
                                >
                                    back
                                </Button>
                                {!self &&
                                    (status == "none" ?
                                        <Button variant="contained"
                                            sx={{ width: "40%", marginLeft: "10%" }}
                                            onClick={handleSendRequest}
                                        >
                                            Send Request
                                        </Button>
                                        :
                                        (status == "requested" ?
                                            <Button variant="contained"
                                                sx={{ width: "40%", marginLeft: "10%" }}
                                                onClick={handleCancelRequest}
                                            >
                                                Cancel request
                                            </Button>
                                            : (status == "incomingRequest" ?
                                                (
                                                    <Button variant="contained"
                                                        sx={{ width: "40%", marginLeft: "10%" }}
                                                        onClick={handleCheckRequest}
                                                    >
                                                        Pending
                                                    </Button>
                                                ) : (
                                                    status == "friends" &&
                                                    <Button variant="contained"
                                                        sx={{ width: "40%", marginLeft: "10%" }}
                                                        onClick={handleUnfriend}
                                                    >
                                                        Unfriend
                                                    </Button>
                                                )
                                            )
                                        )
                                    )


                                }
                            </div>
                        </div>
                    </Box>
                </Paper>
            }
        </div>
    )
}