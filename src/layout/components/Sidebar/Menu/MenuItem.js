import React from "react";
import classNames from "classnames/bind";

import styles from "./Menu.module.scss";
import { NavLink } from "react-router-dom";

const cx = classNames.bind(styles);

function MenuItem({ title, to, icon }) {
  return (
    <NavLink
      className={(nav) => cx("menu_item", { active: nav.isActive })}
      to={to}
    >
      {icon}
      <span className={cx("title")}>{title}</span>
    </NavLink>
  );
}

export default MenuItem;
