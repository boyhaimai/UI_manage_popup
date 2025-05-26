import * as React from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

import UIForPc from "~/Pages/UiForPc/UiForPc";
import UiForMobile from "~/Pages/UiForMobile/UiForMobile";

function Home() {
  const [value, setValue] = React.useState("1");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%", typography: "body1" }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList
            onChange={handleChange}
            aria-label="lab API tabs example"
            sx={{ position: "fixed", border: "none" }}
          >
            <Tab label="Máy tính" sx={{ fontSize: "15px" }} value="1" />
            <Tab label="Điện thoại" sx={{ fontSize: "15px" }} value="2" />
          </TabList>
        </Box>
        <TabPanel value="1" sx={{ padding: "0px" }}>
          <UIForPc />
        </TabPanel>
        <TabPanel value="2" sx={{ padding: "0px" }}>
          <UiForMobile />
        </TabPanel>
      </TabContext>
    </Box>
  );
}

export default Home;
