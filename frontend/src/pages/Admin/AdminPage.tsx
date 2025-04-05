import React from "react";
import { List, ListItem, ListItemText, Divider } from "@mui/material";
import PostManagement from "./Tabs/PostManagement";
import UserManagement from "./Tabs/UserManagement";
import CommentManagement from "./Tabs/CommentManagement";

const AdminPage: React.FC = () => {
    const [activeTab, setActiveTab] = React.useState(0);

    const handleTabChange = (index: number) => {
        setActiveTab(index);
    };

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            {/* Sidebar */}
            <div
                style={{
                    position: "fixed", // Make the sidebar fixed to the left
                    top: 0,
                    left: 0,
                    width: "250px",
                    height: "100vh", // Ensure it spans the full height
                    backgroundColor: "#f4f4f4",
                    padding: "20px",
                    boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
                }}
            >
                <h2 style={{ textAlign: "center" }}>Admin Dashboard</h2>
                <Divider />
                <List>
                    <ListItem
                        sx={{
                            cursor: "pointer",
                            "&:hover": {
                                backgroundColor: "#f0f0f0", // Gray background on hover
                            },
                            backgroundColor: activeTab === 0 ? "#e0e0e0" : "transparent", // Highlight the active tab
                        }}
                        onClick={() => handleTabChange(0)}
                    >
                        <ListItemText primary="Quản lý bài đăng" />
                    </ListItem>
                    <ListItem
                        sx={{
                            cursor: "pointer",
                            "&:hover": {
                                backgroundColor: "#f0f0f0", // Gray background on hover
                            },
                            backgroundColor: activeTab === 1 ? "#e0e0e0" : "transparent", // Highlight the active tab
                        }}
                        onClick={() => handleTabChange(1)}
                    >
                        <ListItemText primary="Quản lý người dùng" />
                    </ListItem>
                    <ListItem
                        sx={{
                            cursor: "pointer",
                            "&:hover": {
                                backgroundColor: "#f0f0f0", // Gray background on hover
                            },
                            backgroundColor: activeTab === 2 ? "#e0e0e0" : "transparent", // Highlight the active tab
                        }}
                        onClick={() => handleTabChange(2)}
                    >
                        <ListItemText primary="Quản lý bình luận" />
                    </ListItem>
                </List>
            </div>

            {/* Main Content */}
            <div
                style={{
                    marginLeft: "250px", // Add margin to account for the fixed sidebar
                    flex: 1,
                    padding: "20px",
                    overflowY: "auto",
                }}
            >
                {activeTab === 0 && <PostManagement />}
                {activeTab === 1 && <UserManagement />}
                {activeTab === 2 && <CommentManagement />}
            </div>
        </div>
    );
};

export default AdminPage;