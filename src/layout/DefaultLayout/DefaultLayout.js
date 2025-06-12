import React, { useState } from "react";
import Header from "~/layout/components/Header/Header";
import Sidebar from "~/layout/components/Sidebar/Sidebar";
import classNames from "classnames/bind";
import styles from "./DefaultLayout.module.scss";

const cx = classNames.bind(styles);

function DefaultLayout({ children }) {
  const [headerOpen, setHeaderOpen] = useState(false);

  return (
    <div className={cx("wrapper")}>
      <div className={cx("container")}>
        <Sidebar setHeaderOpen={setHeaderOpen} />
        <div className={cx("content")}>{children}</div>
        <Header open={headerOpen} onClose={() => setHeaderOpen(false)} />
      </div>
    </div>
  );
}

export default DefaultLayout;