
  const { register, navigate } = require('../../../../../scripts/e2e');

  describe('avatar/standalone', () => {

    register('should init', navigate('http://localhost:3333/src/components/avatar/test/standalone'));

  });
  