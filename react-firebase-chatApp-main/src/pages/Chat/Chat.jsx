import * as React from "react";

import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import {
  Avatar,
  Badge,
  Button,
  ButtonGroup,
  CardHeader,
  Chip,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Select,
  Typography,
} from "@mui/material";
import { useUserAuth } from "../../context/userAuthContext";
import TelegramIcon from "@mui/icons-material/Telegram";
import {
  collection,
  query,
  onSnapshot,
  Timestamp,
  addDoc,
  orderBy,
  updateDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { DrawerWithNav } from "./components/DrawerWithNav";
import moment from "moment";
import "./chat.css";
import { useDrawer } from "../../context/drawerContext";

import axios from "axios";

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

export const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

export const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

export const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

export default function Chat() {
  const [roomId, setRoomId] = React.useState("");
  const [selectedPerson, setSelectedPerson] = React.useState([]);
  const [messages, setMessages] = React.useState([]);
  const [message, setMessage] = React.useState("");
  const [language, setLanguage] = React.useState("");
  const { open, setOpen } = useDrawer();

  const { user } = useUserAuth();
  const [translateMessages, setTranslateMessages] = React.useState([]);

  const scrollToBottom = () => {
    var objDiv = document.getElementById("boxData");
    if (objDiv) {
      objDiv.scrollTop = objDiv?.scrollHeight;
    }
  };

  function getMessages(roomId) {
    return onSnapshot(
      query(
        collection(db, "chats", roomId, "messages"),
        orderBy("time", "asc")
      ),
      (querySnapshot) => {
        const messages = querySnapshot.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        });
        setMessages(messages);
      }
    );
  }

  const handlePersonChat = async (person) => {
    let roomid = [user.uid, person.data.uid].sort();
    roomid = roomid[0] + roomid[1];
    setRoomId(roomid);
    setSelectedPerson(person);
    getMessages(roomid);

    const chats_ref = doc(db, "chats", roomid);
    const myId = user.uid;
    const docSnap = await getDoc(chats_ref);

    if (docSnap.exists()) {
      updateDoc(chats_ref, {
        [myId]: {
          unread_count: 0,
        },
      });
    } else {
      await setDoc(chats_ref, {
        [myId]: {
          unread_count: 0,
        },
      });
    }
    setTimeout(() => {
      scrollToBottom();
    }, 500);
  };

  const updateUnreadCount = async () => {
    const chats_ref = doc(db, "chats", roomId);
    const partnerId = selectedPerson.data.uid;
    const docSnap = await getDoc(chats_ref);

    if (docSnap.exists()) {
      let roomDetail = docSnap.data();
      let partnerUnreadCount =
        roomDetail &&
        roomDetail[partnerId] &&
        roomDetail[partnerId].unread_count;
      updateDoc(chats_ref, {
        [partnerId]: {
          unread_count: partnerUnreadCount ? partnerUnreadCount + 1 : 1,
        },
      }).then(() => {
        // console.log('unread count added');
      });
    } else {
      await setDoc(chats_ref, {
        [partnerId]: {
          unread_count: 1,
        },
      }).then(() => {
        console.log("unread count added");
      });
    }
  };

  const sendMsg = async (e) => {
    e.preventDefault();
    const msg = message.trim();
    // setUsers();
    if (msg) {
      const msgObj = {
        time: Timestamp.now(),
        message: msg,
        sender: user.uid,
        receiver: selectedPerson.data.uid,
      };
      setMessages((oldArray) => [...oldArray, msgObj]);
      updateUnreadCount();
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      try {
        await addDoc(collection(db, "chats", roomId, "messages"), msgObj);
      } catch (error) {
        console.error(error);
      }
      setMessage("");
    } else {
      setMessage("");
    }
  };

  const translateMsgFunc = async (messages) => {
    const apiUrl = "http://localhost:3004/translate";
    const translationResults = [];

    try {
      const translationPromises = messages.map(async (msg, index) => {
        try {
          const response = await axios.get(apiUrl, {
            params: {
              text: msg.message,
              to: language,
            },
          });

          const translationResult = {
            originalMessage: msg,
            translatedMessage: response.data,
          };

          translationResults.push(translationResult);
        } catch (error) {
          console.error("Error:", error);
        }
      });

      // Use Promise.all to wait for all translations to complete
      await Promise.all(translationPromises);

      // Update the state with the accumulated translation results
      setTranslateMessages(translationResults);
    } catch (error) {
      console.error("Error translating messages:", error);
    }
  };

  const handleLanguageSelect = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    // Close the language selection dialog (you can implement this as needed)
    // For example, you can set a state to control the visibility of the dialog.
  };

  React.useEffect(() => {
    translateMsgFunc(messages);
  }, [messages]);
  console.log(translateMessages);

  const sortedMessages = translateMessages.slice().sort((a, b) => {
    const timeA = a.originalMessage.time.toDate();
    const timeB = b.originalMessage.time.toDate();
    return timeA - timeB;
  });
  return (
    <Box sx={{ display: "flex", height: "100%", position: "relative" }}>
      <CssBaseline />
      <DrawerWithNav handlePersonChat={handlePersonChat} />
      {language === "" ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100vh"
        >
          <Box className="langBox">
            <Typography variant="h4" component="h1">
              Please Select your Language
            </Typography>

            <ButtonGroup
              className="buttgroup"
              orientation="vertical"
              aria-label="vertical outlined button group"
            >
              <Button key="hi" onClick={() => setLanguage("hi")}>
                Hindi
              </Button>
              <Button key="mr" onClick={() => setLanguage("mr")}>
                Marathi
              </Button>
              <Button key="en" onClick={() => setLanguage("en")}>
                English
              </Button>
            </ButtonGroup>
          </Box>
        </Box>
      ) : (
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            [theme.breakpoints.down("sm")]: {
              marginLeft: "65px",
              filter: open ? "blur(50px)" : "blur(0px)",
            },
            position: "relative",
            overflow: "hidden",
            maxWidth: "1024px",
            mx: "auto",
          })}
          onClick={() => setOpen(false)}
        >
          <DrawerHeader />
          {selectedPerson?.data ? (
            <Box
              sx={(theme) => ({
                pt: 1,
                [theme.breakpoints.down("lg")]: {
                  px: 2,
                },
              })}
            >
              <CardHeader
                avatar={
                  <Avatar
                    src={selectedPerson?.data?.profile_pictures}
                    aria-label="recipe"
                  />
                }
                sx={{ p: 0, mb: 0.5 }}
                title={selectedPerson?.data?.displayName}
              />
              <Divider />
            </Box>
          ) : null}
          {selectedPerson?.data ? (
            <Box
              sx={{
                height: "calc(100vh - 197px)",
                pt: 1.5,
                display: "flex",
                flexDirection: "column",
                overflow: "auto",
              }}
              id="boxData"
            >
              <Box
                sx={{
                  flex: 1,
                  px: 3,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  mb: 2,
                }}
                className="msgWrapper"
              >
                {sortedMessages?.map((msg, i) => {
                  return (
                    <Box
                      key={i}
                      className={
                        msg?.originalMessage.sender === user.uid
                          ? "myMessage"
                          : "notMyMessage"
                      }
                      sx={{
                        alignSelf:
                          msg?.originalMessage.sender === user.uid
                            ? "end"
                            : "flex-start",
                        my: 0.3,
                        maxWidth: "80%",
                      }}
                    >
                      <Chip
                        color={
                          msg?.originalMessage.sender === user.uid
                            ? "primary"
                            : "secondary"
                        }
                        label={
                          <Box display="flex" flexDirection="column">
                            <span style={{ fontWeight: "500" }}>
                              {msg?.translatedMessage[0]?.translatedText}
                            </span>
                            <Typography
                              variant="body2"
                              color="burlywood"
                              fontWeight={"bold"}
                            >
                              {moment(
                                msg?.originalMessage.time.toDate().toString()
                              ).format("D-MMM-YY, h:mm a")}
                            </Typography>
                          </Box>
                        }
                        sx={{
                          fontSize: "large",
                          height: "auto",
                          p: 1,
                          borderTopRightRadius:
                            msg.sender === user.uid ? "0px" : "16px",
                          borderTopLeftRadius:
                            msg.sender !== user.uid ? "0px" : "16px",
                          "& span": {
                            whiteSpace: "normal",
                          },
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </Box>
          ) : null}
          {selectedPerson?.data ? (
            <form
              onSubmit={sendMsg}
              style={{ position: "sticky", bottom: 0, left: 0 }}
            >
              <Box
                display="flex"
                sx={{ px: 1, alignItems: "center", mb: 0.5, width: "100%" }}
              >
                <Box sx={{ mr: 1, flex: 1 }}>
                  <FormControl sx={{ m: 1, width: "100%" }} variant="outlined">
                    <InputLabel htmlFor="outlined-adornment-password">
                      Message
                    </InputLabel>
                    <OutlinedInput
                      value={message}
                      sx={{ width: "100%" }}
                      onChange={(e) => setMessage(e.target.value)}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton type="submit" edge="end">
                            <TelegramIcon />
                          </IconButton>
                        </InputAdornment>
                      }
                      label="Message"
                    />
                  </FormControl>
                </Box>
              </Box>
            </form>
          ) : null}
        </Box>
      )}
    </Box>
  );
}
