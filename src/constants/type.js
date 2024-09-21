const FollowType = {
    PERSON: 'persion',
    CLUB: 'club',
};
const RoundingMakeType = {
    PERSON: 'persion',
    CLUB: 'club',
};

const ContentType = {
    NOTIFICATION: 'notification', //알람
    NOTE: 'note', //공지사항
    NEWS: 'news', //뉴스
};

const SettingsType = {
    SCORE: 'score', // 평규 타수 관리, hit
    EXPERIENCE: 'experience',  // 골프 경력, experience
    THEME: 'theme',  // 인기 라운딩 테마 , theme
};

const SystemActionType = {
    DELETE: 'delete',
    ADD: 'add',
    UPDATE: 'update',
    LOGIN: 'login',
    LOGOUT: 'logout',
    SIGNUP: 'signup',
    CHANGE_PASSOWRD: 'change password',
    RESET_PASSOWRD: 'reset password',
};


module.exports = {
    FollowType,
    SettingsType,
    RoundingMakeType,
    ContentType,
    SystemActionType,
}