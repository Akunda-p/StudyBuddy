import React, { useMemo } from 'react'
import { useState, useEffect } from 'react';
import { TextField, Button, Grid, Typography, List, Menu, MenuItem, Chip } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import axios from 'axios';
import { IUserDetail, StyledContainer } from '../Profile/Profile';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { storeUser } from '../../redux/reducer/userReducer';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ResultFilter from './ResultFilter';

import { RootState } from '../../redux/store';
import { ICourse } from '../Profile/Course';

import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth0 } from '@auth0/auth0-react';

import CircularProgress from '@mui/material/CircularProgress';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    fontWeight: 'bold',
    borderBottom: `1px solid ${theme.palette.divider}`,
}));




export default function Search() {

    const users = useSelector((state: RootState) => state.storeUser.userList);
    // define key word
    const [searchTerm, setSearchTerm] = useState<string>('');

    const [searchRes, setSearchRes] = useState<IUserDetail[]>(users);

    const [isLoading, setIsLoading] = React.useState<boolean>(false)

    const [flag, setFlag] = useState(false)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const controller = new AbortController()

    const { getAccessTokenSilently } = useAuth0()

    useEffect(() => {
        return () => {
            controller.abort()
        }
    }, [])

    // handel key word change 
    const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    // main logic of search user
    async function handleSearchClick() {
        if (searchTerm) {
            setIsLoading(true)
            // TODO: logic of search friend
            const token = await getAccessTokenSilently()

            const res = await axios.get(`https://studybuddy-production.up.railway.app/users/search/${searchTerm}`, { signal: controller.signal, headers: { Authorization: `Bearer ${token}` } })
            console.log("123")
            if (res.data.length === 0) {
                setFlag(false)
            } else {
                setFlag(true)
                setSearchRes(res.data)
                dispatch(storeUser(res.data))
            }
            setIsLoading(false)
        }
    };

    // when user press Enter, show search result 
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearchClick()
        }
    };

    //redirect to /frienddetail/
    const handleFriendDetail = (id: string) => {
        navigate("/frienddetail/", { state: { id: id } })
    }

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const [filterCourse, setFilterCourse] = useState<string[]>([])
    const handleClose = () => {
        setOpen(false);

    };
    const handleDataChange = (newData: string[]) => {
        // setFilterCourse(newData);
        // console.log(newData)
    };

    const handleSelectedCourses = (selectedCourses: string[]) => {
        console.log(selectedCourses);

        const arr: IUserDetail[] = []

        searchRes.map((item) => {
            selectedCourses.forEach(element => {
                item.courses.map((course) => {
                    if (element === course.CourseNName) {
                        arr.push(item)
                    }
                })
            });
        })
        const newArr = Array.from(new Set(arr));
        console.log(newArr)
        setSearchRes(newArr)
    };

    return (
        <div style={{ width: "100%", textAlign: "center", margin: "0 auto" }}>
            <div>
                <h1>Search Buddies</h1>
                <Grid container justifyContent="center" alignItems="center" spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            onKeyDown={handleKeyDown}
                            fullWidth
                            variant="outlined"
                            label="Search Buddies"
                            value={searchTerm}
                            onChange={handleSearchTermChange}
                            InputProps={{
                                endAdornment: (
                                    <>
                                        <Button onClick={handleClickOpen}>
                                            <FilterAltIcon />
                                        </Button>
                                        <Button variant="contained"
                                            onClick={handleSearchClick}>
                                            Search
                                        </Button>
                                    </>
                                )
                            }}
                        />
                    </Grid>
                    <ResultFilter open={open}
                        handleClickOpen={handleClickOpen}
                        handleClose={handleClose}
                        users={searchRes}
                        onSelectedCoursesChange={handleSelectedCourses}
                        onSubmit={handleDataChange}
                    />
                </Grid>
                {isLoading ? <CircularProgress size={150} style={{ marginTop: "10vh" }} /> :
                    <Box sx={{ p: 2 }}>
                        <Paper elevation={24}>
                            <TableContainer component={Paper} >
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <StyledTableCell></StyledTableCell>
                                            <StyledTableCell>Name</StyledTableCell>
                                            <StyledTableCell>UniID</StyledTableCell>
                                            <StyledTableCell>Email</StyledTableCell>
                                            <StyledTableCell>Faculty</StyledTableCell>
                                            <StyledTableCell>Major</StyledTableCell>
                                            <StyledTableCell>Courses</StyledTableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {searchRes.map((item) => (
                                            <TableRow key={item._id} onClick={() => handleFriendDetail(item._id)}>
                                                <TableCell><Avatar alt="Remy Sharp" src={item.userAvatar} /></TableCell>
                                                <TableCell>{item.name}</TableCell>
                                                <TableCell>{item.uniID}</TableCell>
                                                <TableCell>{item.email}</TableCell>
                                                <TableCell>{item.faculty}</TableCell>
                                                <TableCell>{item.major}</TableCell>
                                                <TableCell>{item.courses.map((item) => {
                                                    return <Chip style={{
                                                        marginBottom: '0.2em'
                                                    }} key={item.course_code} label={item.CourseNName}></Chip>
                                                })}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>

                                </Table>
                            </TableContainer>
                        </Paper>
                    </Box>
                }
            </div>
        </div>
    );
}

