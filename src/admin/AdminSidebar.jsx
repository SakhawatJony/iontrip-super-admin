import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import BookOutlinedIcon from "@mui/icons-material/BookOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const menuItems = [
  { label: "Dashboard", icon: <HomeOutlinedIcon />, hasArrow: false },
  { label: "Bookings", icon: <BookOutlinedIcon />, hasArrow: true },
  { label: "Settings", icon: <SettingsOutlinedIcon />, hasArrow: true },
  { label: "Wallet", icon: <AccountBalanceWalletOutlinedIcon />, hasArrow: false },
  { label: "Account", icon: <PersonOutlineOutlinedIcon />, hasArrow: true },
  { label: "Manage", icon: <ManageAccountsOutlinedIcon />, hasArrow: true },
  { label: "Ot Reports", icon: <BarChartOutlinedIcon />, hasArrow: true },
  { label: "Logout", icon: <LogoutOutlinedIcon />, hasArrow: false },
];

export default function AdminSidebar() {
  return (
    <Box
      sx={{
        bgcolor: "white",
        borderRadius: 1,
        p: 2.5,
        minHeight: "calc(100vh - 120px)",
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
      }}
    >
      <Box sx={{ lineHeight: 1.1 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 800, color: "#1f2a44", letterSpacing: 0.6 }}
        >
       IonTrip
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: "#7b8794",
            letterSpacing: 3,
          }}
        >
          TECH
        </Typography>
      </Box>
      <List sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.label}
            sx={{
              borderRadius: 1.5,
              px: 1.5,
              py: 0.9,
              color: "#3b4456",
            }}
          >
            <ListItemIcon sx={{ minWidth: 34, color: "#3b4456" }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: 15,
                fontWeight: 500,
              }}
            />
            {item.hasArrow && (
              <Box
                sx={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  bgcolor: "#1f2a44",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <KeyboardArrowDownIcon
                  sx={{ fontSize: 16, color: "white" }}
                />
              </Box>
            )}
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ my: 1.5 }} />
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, pt: 1 }}>
        <Avatar sx={{ bgcolor: "#f1f3f7", color: "#1f2a44" }}>S</Avatar>
        <Box>
          <Typography sx={{ fontWeight: 600, color: "#1f2a44", fontSize: 15 }}>
            Sakhawat Hosen
          </Typography>
          <Typography variant="caption" sx={{ color: "#6b7280" }}>
            Project Manager
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
