// Keep unfinished membership features available in source for a later release.
window.HBG_SITE_ACCESS=Object.freeze({
 signupEnabled:false,
 adminOnlyPosting:true,
 signupMessage:'회원가입 서비스는 준비 중입니다. 현재 관리자만 이용할 수 있습니다.'
});
window.showSignupUnavailable=function(){
 const notice=document.getElementById('signupServiceNotice');
 if(notice){notice.textContent=window.HBG_SITE_ACCESS.signupMessage;notice.hidden=false;}
 else alert(window.HBG_SITE_ACCESS.signupMessage);
};
