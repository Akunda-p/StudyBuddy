import TopBar from '../component/SandBox/TopBar'
import Content from '../component/SandBox/Content';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import dogPic from './../ICON/dog.png'
import Divider from '@mui/material/Divider';
import { useEffect } from 'react';
import { io, Socket } from "socket.io-client"
import { useAuth0 } from '@auth0/auth0-react';
import React from 'react';

var socket: Socket


interface IUserExists {
  userExists: boolean
}

export default function SandBox(userExists: IUserExists) {

  const { getAccessTokenSilently } = useAuth0()
  const [connection, setConnection] = React.useState<boolean>(false)

  useEffect(() => {
    const conncectSocket = async () => {

      if (userExists.userExists) {
        const token = await getAccessTokenSilently()
        socket = io("https://studybuddy-production.up.railway.app", { transports: ['websocket'], extraHeaders: { Authorization: `Bearer ${token}` }, query: { token: `${token}` } })
        setConnection(true)
        socket.emit("Ping")
        socket.on("Pong", () => {
          console.log("pong")
        })
        socket.on("checkChat", (msgID: string, userID: string) => {
          socket.emit("checkChat", msgID, userID)
        })
        socket.on("sendChat", (msgID: string, joinedChat: string) => {
          socket.emit(`joinedChat${msgID}`, joinedChat)
        })
      }


    }
    conncectSocket()

  }, [userExists.userExists])

  useEffect(() => {
    console.log("re")

  }, [])

  return (

    <Grid container spacing={2} style={{
      backgroundImage: `url(${dogPic})`,
      backgroundColor: '#ADD8E6',
      backgroundSize: '5em',
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
    }}>
      <Grid item xs={12}>
        <TopBar connection={connection} />
      </Grid>
      <Divider />

      <Grid item xs={12} className="asdasdasd" >
        <Container maxWidth="lg" sx={{ height: "100vh" }} style={{ flexGrow: 1, overflowY: 'auto', paddingTop: '10vh' }}>
          <Content />
        </Container>
      </Grid>
    </Grid>




  )
}


export { socket }
