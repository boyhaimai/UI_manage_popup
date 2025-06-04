import React, { useState, useEffect } from "react";
import noImage from "~/Components/assets/image/noImage.png";
import classNames from "classnames/bind";
import styles from "./Avatar.module.scss";

const cx = classNames.bind(styles);

function Avatar({ src, alt, className, ...props }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // reset lỗi nếu src thay đổi (ví dụ: người dùng chọn ảnh mới)
    setHasError(false);
  }, [src]);

  return (
    <img
      src={hasError ? noImage : src}
      alt={alt}
      className={cx(styles.wrapper, className)}
      onError={() => setHasError(true)}
      {...props}
    />
  );
}

export default Avatar;
