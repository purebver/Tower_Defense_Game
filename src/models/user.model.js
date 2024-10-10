const users = [];

//유저를 저장할 배열 생성
export const addUser = (user) => {
  users.push(user);
  console.log(users);
};

//유저 접속 해제
export const removeUser = (accountId) => {
  const index = users.findIndex((user) => user.accountId === accountId);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

//모든 유저 정보 가져오기
export const getUser = () => {
  return users;
};
