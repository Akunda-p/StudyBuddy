import React, { ChangeEvent, useEffect, useState } from 'react'
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Button from '@mui/material/Button';
import axios from 'axios'
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Joi from 'joi';
import { useAuth0 } from '@auth0/auth0-react';
import { useDispatch } from "react-redux";
import { storeUser } from "../../redux/reducer/userReducer";
import { useNavigate } from 'react-router';
import { StyledContainer } from '../Profile/Profile';
import { Paper } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
// move to own file

export interface IMajor {
    faculty: string
    major: string
}
export interface IMajorApiReturn {
    faculties: string[]
    majors: IMajor[]
}

// move to own file
interface IApiOptions {
    token?: string // optional, else undefiled
    signal?: AbortSignal
}
// move to own api folder + file
// @param - possibly give authentication token to this api function
// @param - possibly give abort signal (research this!)



interface ISignUpProps {
    changeUserState: (state: boolean) => void;
}

export default function SignUp(props: ISignUpProps) {


    // TODO save all things to redux
    const [name, setName] = React.useState('');
    const [uniID, setUniID] = React.useState('');
    const [gender, setGender] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [faculty, setFaculty] = React.useState('');
    const [major, setMajor] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [faculties, setFaculties] = React.useState<string[]>([]);
    const [majors, setMajors] = React.useState<IMajor[]>([]);
    const [authID, setAuthID] = useState<any>('')
    const navigate = useNavigate()
    const { user, isAuthenticated } = useAuth0()
    const controller = new AbortController()
    const { getAccessTokenSilently } = useAuth0()
    const [isLoading, setIsLoading] = React.useState<boolean>(true)

    useEffect(() => {
        // what happens if user navigates away from this page while this request is running?
        // error: tried to update state of unloaded component
        apiGetMajor({ signal: controller.signal }).then(data => {
            if (data != null) {
                setFaculties(data.faculties)
                setMajors(data.majors)
                if (isAuthenticated && user) {
                    setAuthID(user.sub)
                }
            }
        }).finally(() => setIsLoading(false))

        // this function is run on return, and will disable the api request and state update
        return () => {
            controller.abort()
        }
    }, [isAuthenticated, user])

    const apiGetMajor = async (option: IApiOptions): Promise<IMajorApiReturn | null> => {
        const token = await getAccessTokenSilently()
        const res = await axios.get("https://studybuddy-production.up.railway.app/major/", {
            signal: option.signal,
            headers: { Authorization: `Bearer ${token}` }
        })

        // consider console.error to log the failure
        if (res.status != 200) return null;

        // you can validate data here as well
        // consider doing this serverside for any user submission data
        const validationResult = Joi.object<IMajorApiReturn>({
            faculties: Joi.array().items(Joi.string()),
            majors: Joi.array().items(
                Joi.object({
                    faculty: Joi.string().required(),
                    major: Joi.string().required()
                }).unknown(true)
            )
        }).validate(res.data)

        if (validationResult.error) {
            console.error(validationResult.error)
            return null;
        }

        return validationResult.value;
    }


    const handleName = (event: ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };
    const handleUniID = (event: ChangeEvent<HTMLInputElement>) => {
        setUniID(event.target.value);
    };
    const handleEmail = (event: ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
    };
    const handleGender = (event: SelectChangeEvent) => {
        setGender(event.target.value);
    };
    const handleFaculty = (event: SelectChangeEvent) => {
        setFaculty(event.target.value);
        setMajor('')
    };
    const handleMajor = (event: SelectChangeEvent) => {
        setMajor(event.target.value);
    };

    async function handleSubmit() {
        const sessionData: {
            name: String,
            uniID: String,
            gender: String,
            email: String,
            faculty: String,
            major: String,
            authID: String,
            userAvatar: string | undefined,
        } = {
            name: name,
            uniID: uniID,
            gender: gender,
            email: email,
            faculty: faculty,
            major: major,
            authID: authID,
            userAvatar: user?.picture
        }

        if (sessionData.name && sessionData.uniID) {
            await createUser(sessionData).then(() => {
                props.changeUserState(true)
                navigate('/home')
            })
        } else {
            setMessage("All required fields must be filled in!")
        }
    }

    async function createUser(user: object) {
        // TODO : persisting stoer data
        console.log(user)
        // dispatch(storeUser(user))
        const token = await getAccessTokenSilently()
        await axios.post(
            "https://studybuddy-production.up.railway.app/users/api/register",
            user,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        )
    }

    return (
        <StyledContainer>
            {isLoading ? <div style={{ textAlign: "center" }}><CircularProgress size={150} style={{ marginTop: "40vh" }} /></div> :
                <div style={{ width: "100%", textAlign: "center", margin: "0 auto" }}>
                    <div>
                        <h1>Sign Up</h1>
                    </div>
                    <Paper elevation={24}>
                        <div style={{ padding: '1em' }}>
                            <div style={{ marginBottom: "10px" }}>
                                <TextField
                                    required
                                    id="name"
                                    label="Name"
                                    onChange={handleName}
                                    fullWidth
                                />
                            </div>
                            <div style={{ marginBottom: "10px" }}>
                                <TextField
                                    required
                                    id="uniID"
                                    label="Uni ID"
                                    onChange={handleUniID}
                                    fullWidth
                                />
                            </div>
                            <div style={{ marginBottom: "10px" }}>
                                <FormControl sx={{ width: "100%" }}>
                                    <InputLabel>Gender</InputLabel>
                                    <Select
                                        id="gender"
                                        label="Gender"
                                        value={gender}
                                        onChange={handleGender}
                                    >
                                        <MenuItem value="">
                                            <em>Prefer Not To Tell</em>
                                        </MenuItem>
                                        <MenuItem value={"Male"}>Male</MenuItem>
                                        <MenuItem value={"Female"}>Female</MenuItem>
                                        <MenuItem value={"Other"}>Other</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                            <div style={{ marginBottom: "10px" }}>
                                <TextField
                                    id="email"
                                    label="Communication Email"
                                    onChange={handleEmail}
                                    fullWidth
                                />
                            </div>
                            <div style={{ marginBottom: "10px" }}>
                                <FormControl sx={{ width: "100%" }}>
                                    <InputLabel>Faculty</InputLabel>
                                    <Select
                                        id="faculty"
                                        label="Faculty"
                                        value={faculty}
                                        onChange={handleFaculty}
                                    >
                                        <MenuItem value="">
                                            <em>Prefer Not To Tell</em>
                                        </MenuItem>
                                        {faculties.map((faculty: any) => {
                                            return (<MenuItem value={faculty}>{faculty}</MenuItem>)
                                        })}


                                    </Select>
                                </FormControl>
                            </div>
                            <div>
                                <FormControl sx={{ width: "100%" }}>
                                    <InputLabel>Major</InputLabel>
                                    <Select
                                        id="major"
                                        label="Major"
                                        value={major}
                                        onChange={handleMajor}
                                    >
                                        <MenuItem value="">
                                            <em>Prefer Not To Tell</em>
                                        </MenuItem>
                                        {majors.map((major: IMajor) => {
                                            if (major.faculty == faculty)
                                                return (<MenuItem value={major.major}>{major.major}</MenuItem>)

                                        })}

                                    </Select>
                                </FormControl>
                            </div>
                        </div>
                    </Paper>
                    <div style={{ marginTop: '10px' }}>
                        <Button variant="contained"
                            onClick={handleSubmit}
                            sx={{ width: "100%" }}
                        >
                            Continue
                        </Button>
                    </div>
                    <div>
                        {message && <Alert severity="error">{message}</Alert>}
                    </div>

                </div>
            }
        </StyledContainer>

    )
}