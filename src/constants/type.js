const FollowType = {
    PERSON: 'persion',
    CLUB: 'club',
};
const RoundingMakeType = {
    PERSON: 'persion',
    CLUB: 'club',
};

const SettingsType = {
    LIFE: 'life', //  골르라이프 관리
    HIT: 'hit', // 평규 타수 관리, hit
    EXPERIENCE: 'experience',  // 골프 경력, experience
    NOTE: 'note',  // 골프 노트 분류 note
    INVITOR: 'invitor',  // 초청자 분류, invitor
    ROUNDING: 'rounding',  // 찾는 라운딩 타입, rounding
    THEME: 'theme',  // 인기 라운딩 테마 , theme
    MEETING: 'meeting',  // 모임 관리          meeting
};

module.exports = {
    FollowType,
    SettingsType,
    RoundingMakeType,
}