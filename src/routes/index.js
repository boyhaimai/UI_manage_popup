import config from "~/config";
import LoginAdmin from "~/Pages/Login_admin";
import RegisterAdmin from "~/Pages/Register_admin";
import AddWebsite from "~/Pages/AddWeb";
import CustomizeUI from "~/Pages/CustomizeUI/CustomizeUI";
import CopyCode from "~/Pages/CopyCode";
import ManagePage from "~/Pages/ManagePage/ManagePage";
import Message from "~/Pages/ManageMessage/ManageMessage";
import DetailConversation from "~/Pages/DetailConversation/DetailConversation";
import SettingPage from "~/Pages/SettingPage/SettingPage";
import Profile from "~/Pages/Profile/Profile";

const publicRoutes = [
  { path: config.routes.login_admin, component: LoginAdmin, layout: null },
  {
    path: config.routes.register_admin,
    component: RegisterAdmin,
    layout: null,
  },
  { path: config.routes.addWebsite, component: AddWebsite, layout: null },
  { path: config.routes.customizeUi, component: CustomizeUI, layout: null },
  { path: config.routes.copyCode, component: CopyCode, layout: null },
  { path: config.routes.managePage, component: ManagePage },
  { path: config.routes.message, component: Message },
  { path: config.routes.DetailConversation, component: DetailConversation },
  { path: config.routes.SettingPage, component: SettingPage },
  { path: config.routes.profile, component: Profile },
];

// truy cập riêng tư nếu không phải public thì chuyển hướng sang trang login
const privateRoutes = [];

export { publicRoutes, privateRoutes };
