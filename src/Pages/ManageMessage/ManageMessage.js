import React from 'react';
import classNames from 'classnames/bind';
import styles from './ManageMessage.module.scss';

const cx = classNames.bind(styles);

function ManageMessage() {
    return (
       <div className={cx("wrapper")}>
            <div className={cx("title")}>Chat Widget</div>
            
        </div>
    );
}

export default ManageMessage;