import React from 'react';
import {Route, Routes} from "react-router-dom";
import Notice from "../pages/admin/Notice";
import NoticeContext from "../pages/admin/NoticeContext";
import NoticeModify from "../pages/admin/NoticeModify";
import QnADetail from "../pages/admin/QnADetail";
import QnAList from "../pages/admin/QnAList";
import RecipeBoard from "../pages/admin/RecipeBoard";
import UserInfo from "../pages/admin/UserInfo";

function AdminRouter(){
    return(
        <Routes>
            <Route path="/" element={<UserInfo/>}/>
            <Route path="/recipeBoard" element={<RecipeBoard/>}/>
            <Route path="/notice" element={<Notice/>}/>
            <Route path="/noticeContext" element={<NoticeContext/>}/>
            <Route path="/noticeModify" element={<NoticeModify/>}/>
            <Route path="/qnADetail" element={<QnADetail/>}/>
            <Route path="/qnAList" element={<QnAList/>}/>
        </Routes>
    );
}

export default AdminRouter;