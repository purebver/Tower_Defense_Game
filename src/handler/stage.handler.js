export const moveStageHandler = async (uuid, payload) => {
  try {
    // 점수를 검증해야 하는데
    const response = { status: 'success', message: 'level up' };
    return response;
  } catch (e) {
    console.error(e);
  }
};
