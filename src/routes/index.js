import config from "~/config";
import LoginAdmin from "~/Pages/Login_admin"
import RegisterAdmin from "~/Pages/Register_admin";
import ConfigUi from "~/Pages/Config_ui/Config_ui"
import selectWebsite from "~/Pages/SelectWebsite"


const publicRoutes = [
  { path: config.routes.login_admin, component: LoginAdmin },
  { path: config.routes.register_admin, component: RegisterAdmin },
  { path: config.routes.config, component: ConfigUi },
  { path: config.routes.selectWebsite, component: selectWebsite },
];

// truy cập riêng tư nếu không phải public thì chuyển hướng sang trang login
const privateRoutes = [];

export { publicRoutes, privateRoutes };
