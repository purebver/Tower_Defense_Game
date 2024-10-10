const users = [];

//유저를 저장할 배열 생성
export const addUser = (token) => {
  users.push(token);
};

//유저 접속 해제
export const removeUser = (token) => {
  const index = users.findIndex((user) => user === token);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

//모든 유저 정보 가져오기
export const getUser = () => {
  return users;
};
