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
    EVENT: 'event', //BLOG
    ADEVERTISING: 'advertising'
};

const BlogFilterType = {
    MINE: 'mine',
    REVIEWS: 'reviews',
}
const SettingsType = {
    HIT: 'hit', // 평규 타수 관리, hit
    EXPERIENCE: 'experience',  // 골프 경력, experience
    THEME: 'theme',  // 인기 라운딩 테마 , theme
    BLOG: 'blog',  // blog테마 , theme
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

const RequestType = {
    REQUEST: 'request',
    INVITE: 'invite',
    OWN: 'own',
}

const ClubJoinApproval = {
    ADMIN: 'admin', // actually ,admin & owner
    OWNER: 'owner',
    NONE: 'none',
}

const ClubAdminSelection = {
    ADMIN: 'admin',
    OWNER: 'owner',
}

const MessageType = {
    REQUEST: 'request',
    ACCEPT: 'accept',
    NORMAL: 'normal',
}

module.exports = {
    FollowType,
    SettingsType,
    RoundingMakeType,
    ContentType,
    BlogFilterType,
    SystemActionType,
    RequestType,
    MessageType,
}