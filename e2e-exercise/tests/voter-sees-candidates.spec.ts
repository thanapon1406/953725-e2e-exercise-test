import { expect, test } from '@playwright/test';

test('a voter registers and then sees the candidates of their district', async ({ request }) => {
  const voter = {
    nationalId: '9823527330875',
    password: 'voter1234',
    firstName: 'ฐนพล',
    lastName: 'สารสมุทร',
    address: '110 m 12',
    districtId: 'CM-2',
  };

  // 1st step: voter goes to register
  const registerRes = await test.step('voter registers', () =>
    request.post('/auth/register', { data: voter }),
  );
});
