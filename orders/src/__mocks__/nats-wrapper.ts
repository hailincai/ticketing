export const natsWrapper = {
  client: {
    publish: jest
      .fn()
      .mockImplementation(
        (subject: string, data: String, callback: () => void) => {
          callback();
        }
      ),
  },
};
