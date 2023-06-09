import React, { useEffect } from 'react';
import { createStyles, makeStyles } from '@mui/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import SideBar from './SideBar';
import PetsIcon from '@mui/icons-material/Pets';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import { Theme } from '@mui/material';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { notification } from 'antd';
import { socket } from '../../view/SandBox';
import { Socket } from 'socket.io-client';



interface IConnection {
  connection: boolean
}


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
  }),
);

export default function TopBar(connection: IConnection) {

  const classes = useStyles();
  const [auth, setAuth] = React.useState(true);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const { logout } = useAuth0();
  const [notificationCount, setNotificationCount] = React.useState<number>(0)


  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAuth(event.target.checked);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotification = () => {
    navigate("/notification/")
  }

  const redirectToProfile = () => {
    console.log('MyAccount')
    navigate('/profile')
    handleClose()
  }

  const logOut = () => {
    console.log('log out')
    logout({ logoutParams: { returnTo: window.location.origin } })
    localStorage.removeItem('token')
    handleClose()

  }

  useEffect(() => {
    Notification.requestPermission()
  }, [])

  useEffect(() => {
    if (connection.connection) {
      socket.on("newNotification", () => {
        setNotificationCount((count) => count + 1)
      })
      socket.on("newNotificationAlert", (notification) => {
        setNotificationCount((count) => count + 1)
        new Notification(notification.senderName, { body: `${notification.msg}` })
      })
      socket.on("getNotificationCount", (notificationCount) => {
        setNotificationCount(notificationCount)
      })
      setTimeout(() => { socket.emit("getNotificationCount") }, 100)

    }


  }, [connection.connection])



  return (
    <div className={classes.root}>

      <AppBar position="fixed">
        <Toolbar>
          <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu" onClick={() => {
            // console.log('123')
          }}>
            <SideBar />
          </IconButton>


          <Typography variant="h6" className={classes.title} style={{
            textAlign: 'center'
          }}>
            <PetsIcon />
          </Typography>
          {auth && (
            <div className="123">
              <Typography variant="h6" className={classes.title} style={{
              }}>

                <IconButton
                  size="large"
                  aria-label="show 17 new notifications"
                  color="inherit"
                  onClick={handleNotification}
                >
                  <Badge badgeContent={notificationCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>

                <IconButton
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={open}
                  onClose={handleClose}
                >
                  <MenuItem onClick={() => {
                    redirectToProfile()
                  }} >My account</MenuItem>

                  <MenuItem onClick={() => {
                    logOut()
                  }}>Log out</MenuItem>
                </Menu>

              </Typography>
            </div>
          )}
        </Toolbar>
      </AppBar>
    </div>
  );
}