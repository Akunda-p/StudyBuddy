import React, { useEffect } from 'react';
import axios from 'axios';
import { useAuth0 } from "@auth0/auth0-react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useState } from "react";
import { Box, TextField } from "@mui/material";
import styled from "@mui/styled-engine";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { Alert, Slide } from '@mui/material';
import { deepPurple } from '@mui/material/colors';
import { IMajor, IMajorApiReturn } from '../SignUp/SignUp';
import Stack from '@mui/material/Stack';
import Fade from '@mui/material/Fade';
import { Collapse, } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Paper from '@mui/material/Paper';
import ImageList from '@mui/material/ImageList';
import Container from '@mui/material/Container';
import ImageListItem from '@mui/material/ImageListItem'; import {

  Avatar,
  Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import UserAvatar from './UserAvatar';
import Course, { ICourse } from './Course';
import Joi from 'joi';
import CircularProgress from '@mui/material/CircularProgress';

export const StyledContainer = styled("div")({
  margin: "0 auto",
  paddingTop: "2.0em"
});



const StyledTextField = styled(TextField)({
  width: "100%",
  marginBottom: "1rem",
});

const StyledButton = styled(Button)({
  width: "100%",
});
export interface IUserDetail {
  name: string,
  uniID: string,
  gender: string,
  email: string,
  faculty: string,
  major: string,
  authID: string,
  userAvatar: string,
  _id: string,
  courses: ICourse[]
}


export default function Profile() {

  const [userProfile, setUserProfile] = useState<IUserDetail>({
    name: "",
    uniID: "",
    gender: "",
    email: "",
    faculty: "",
    major: "",
    authID: "",
    userAvatar: "",
    _id: "",
    courses: []
  });

  const { user, isAuthenticated } = useAuth0();

  // select option
  const [selectedFaculty, setSelectedFaculty] = useState<string>("");

  const [majors, setMajors] = useState<IMajor[]>([])

  const [faculties, setFaculties] = useState<string[]>([])

  const controller = new AbortController()

  const { getAccessTokenSilently } = useAuth0()

  const [isLoading, setIsLoading] = React.useState<boolean>(true)

  const handleFacultyChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setUserProfile({
      ...userProfile,
      [name]: value,
    });
    setSelectedFaculty(value);
    // setSelectedMajor("");
  };

  const handleMajorChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setUserProfile({
      ...userProfile,
      [name]: value,
    });
    // setSelectedMajor(value);
  };

  const handleGenderChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setUserProfile({
      ...userProfile,
      [name]: value,
    });
  };

  const filteredMajors = majors.filter((major) => major.faculty === selectedFaculty);

  // get userprofile
  useEffect(() => {
    const fetchData = async () => {
      if (user && isAuthenticated) {
        // setUserProfile;
        const token = await getAccessTokenSilently()
        const resProfile = await axios.get(`https://studybuddy-production.up.railway.app/users/getprofile`, {
          signal: controller.signal,
          headers: { Authorization: `Bearer ${token}` }
        })
          const dbUserValidate = Joi.object<IUserDetail>({
            name: Joi.string().required(),
            uniID: Joi.string().required(),
            gender: Joi.string().required().allow(null, ''),
            email: Joi.string().required().allow(null, ''),
            faculty: Joi.string().required().allow(null, ''),
            major: Joi.string().required().allow(null, ''),
            authID: Joi.string().required(),
            userAvatar: Joi.string().required(),
            _id: Joi.string().required(),
            courses: Joi.array().items(
              Joi.object<ICourse>({
                course_code: Joi.string().required(),
                course_name: Joi.string().required(),
                CourseNName: Joi.string().required(),
              }).unknown(true)
            ).required().allow(null)
          }).unknown(true).validate(resProfile.data[0])
          if (dbUserValidate.error) {
            console.log(dbUserValidate.error)
          } else {
            setUserProfile(dbUserValidate.value)
            setSelectedFaculty(dbUserValidate.value.faculty)

          }
        
        const resMajor = await axios.get("https://studybuddy-production.up.railway.app/major/", {
          signal: controller.signal,
          headers: { Authorization: `Bearer ${token}` }
        })
          const dbFacultiesValidate = Joi.array().items(Joi.string().required()).required().validate(resMajor.data.faculties)
          if (dbFacultiesValidate.error) {
            console.log(dbFacultiesValidate.error)
          } else {
            setFaculties(dbFacultiesValidate.value)
          }
          const dbMajorsValidate = Joi.array().items(
            Joi.object<IMajor>({
              faculty: Joi.string().required(),
              major: Joi.string().required()
            }).unknown(true)
          ).validate(resMajor.data.majors)
          if (dbMajorsValidate.error) {
            console.log(dbMajorsValidate.error)
          } else {
            setMajors(dbMajorsValidate.value)
          }
        
      }
    }
    fetchData().finally(() => setIsLoading(false))
    return () => {
      controller.abort();
    }
  }, [user, isAuthenticated]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserProfile({
      ...userProfile,
      [name]: value,
    });
  };

  const handleSaveChanges = async () => {
    console.log(JSON.stringify(userProfile));
    // TODO send update request to backend

    if (userProfile.name === '' || userProfile.uniID === '') {
      handleError()
    } else {
      const token = await getAccessTokenSilently()
      await axios.patch(`https://studybuddy-production.up.railway.app/users/profile/update`, userProfile, { signal: controller.signal, headers: { Authorization: `Bearer ${token}` } }).then((res) => {
        const acknowledgedValidate = Joi.boolean().required().validate(res.data.acknowledged)
        if (acknowledgedValidate.error) {
          console.log(acknowledgedValidate.error)
        } else {
          if (res.data.acknowledged) {
            handleSuccess()
          } else {
            handleError()
          }
        }
      })
    }
  };

  // click save button, if success the green alert will appear, if failed alert will be red 
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const handleSuccess = () => {
    setShowSuccessAlert(true);
    setShowErrorAlert(false);
    setTimeout(() => setShowSuccessAlert(false), 2000);
  };

  const handleError = () => {
    setShowErrorAlert(true);
    setShowSuccessAlert(false);
    setTimeout(() => setShowErrorAlert(false), 2000);
  };


  // dialog open or not
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = (close: boolean) => {
    setOpen(close)
  };

  const setUserPic = (picSrc: string) => {
    console.log(picSrc)

    setUserProfile({
      ...userProfile,
      userAvatar: picSrc,
    });
  }

  const setCourse = (value: ICourse[]) => {
    setUserProfile({
      ...userProfile,
      courses: value,
    });
  }

  return (
    <div>
      {isLoading ? <div style={{ textAlign: "center" }}><CircularProgress size={150} style={{ marginTop: "40vh" }} /></div> :
        <div style={{ width: "100%", textAlign: "center", margin: "0 auto" }}>
          <Stack spacing={2}>
            {showSuccessAlert && (
              <Fade in={showSuccessAlert} timeout={1000} >
                <Alert variant="filled" severity="success" onClose={() => setShowSuccessAlert(false)} sx={{ position: 'fixed', zIndex: '1', width: '80vw', left: '0', right: '0', margin: '-3em auto' }}>
                  Update successful
                </Alert>
              </Fade>
            )}
            {showErrorAlert && (
              <Fade in={showErrorAlert} timeout={1000}>
                <Alert variant="filled" severity="error" onClose={() => setShowErrorAlert(false)} sx={{ position: 'fixed', zIndex: '1', width: '80vw', left: '0', right: '0', margin: '-3em auto' }}>
                Update failed
                </Alert>
              </Fade>
            )}
          </Stack>
          <div >
            <h1>Edit Profile</h1>
            <div style={{
              'display': 'flex',
              'justifyContent': 'center'
            }}>
              <Avatar sx={{ bgcolor: deepPurple[500], width: 56, height: 56, marginBottom: "1rem" }}
                src={userProfile.userAvatar}
                onClick={handleClickOpen}
              ></Avatar>

              {/* user Avatar */}
              <UserAvatar isOpen={open} handleClose={handleClose} setUserPic={setUserPic} userPic={userProfile.userAvatar} />
            </div>


            <Paper elevation={24} >

              <form style={{ padding: '1em' }}>
                <StyledTextField
                  label="Name"
                  name="name"
                  value={userProfile.name}
                  onChange={handleChange}
                />
                <StyledTextField
                  label="University ID"
                  name="uniID"
                  value={userProfile.uniID}
                  onChange={handleChange} sx={{ opacity: 1 }}

                />
                <>
                  <FormControl sx={{ width: "100%" }} style={{ marginBottom: "10px" }}>
                    <InputLabel id="gender-label">Gender</InputLabel>
                    <Select
                      labelId="gender-label"
                      id="gender-select"
                      label="Gender"
                      name="gender"
                      value={userProfile.gender}
                      onChange={handleGenderChange}
                      sx={{ textAlign: 'left' }}
                    >
                      <MenuItem value="">
                        <em>Prefer Not To Tell</em>
                      </MenuItem>
                      <MenuItem value={"Male"}>Male</MenuItem>
                      <MenuItem value={"Female"}>Female</MenuItem>
                      <MenuItem value={"Other"}>Other</MenuItem>
                    </Select>
                  </FormControl>
                </>
                <StyledTextField
                  label="Email"
                  name="email"
                  value={userProfile.email}
                  onChange={handleChange}
                />
                <div>
                  <FormControl sx={{ width: "100%" }} style={{ textAlign: 'left', marginBottom: "10px" }}>
                    <InputLabel id="faculty-label">Faculty</InputLabel>
                    <Select
                      labelId="faculty-label"
                      id="faculty-select"
                      value={userProfile.faculty}
                      label="Faculty"
                      name="faculty"
                      onChange={handleFacultyChange}
                    >
                      {faculties.map((faculty) => (
                        <MenuItem key={faculty} value={faculty}>
                          {faculty}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
                <div >
                  <FormControl sx={{ width: "100%", textAlign: 'left' }} >
                    <InputLabel id="major-label">Major</InputLabel>
                    <Select
                      labelId="major-label"
                      id="major-select"
                      value={userProfile.major}
                      label="Major"
                      name="major"
                      onChange={handleMajorChange}
                      disabled={!selectedFaculty}
                    >
                      {filteredMajors.map((major, index) => (
                        <MenuItem key={index} value={major.major}>
                          {major.major}
                        </MenuItem>
                      ))}
                    </Select>
                    <Course selectedCourse={userProfile.courses} setCourse={setCourse} />
                  </FormControl>
                </div>
              </form>
            </Paper>
            <StyledButton variant="contained" onClick={handleSaveChanges} style={{ marginTop: "10px", marginBottom: "3em" }}>
              Save Changes
            </StyledButton>
            {/* </form>
          </Paper> */}
          </div>
        </div>
      }
    </div>
  );
}