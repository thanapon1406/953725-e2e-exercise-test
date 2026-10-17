import { expect, test } from '@playwright/test';

test('a voter registers and then sees the candidates of their district', async ({ request }) => {
  const voter = {
    // ผมรัน node tools/randomThaiNationalId.mjs แล้วได้เลข 9823527330875
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
  // 2nd step: assert the response
  await test.step('You are a VOTER', async () => {
    expect(registerRes.status(), await registerRes.text()).toBe(201);
    const user = await registerRes.json();
    expect(user).toEqual({
      id: expect.any(Number),
      nationalId: voter.nationalId,
      firstName: voter.firstName,
      lastName: voter.lastName,
      address: voter.address,
      districtId: voter.districtId,
      role: 'VOTER',
    });
    expect(user).not.toHaveProperty('passwordHash');
  });

  // 3rd step: voter signs in to receive an access token
  const accessToken = await test.step('voter signs in successfully', async () => {
    const loginResponse = await request.post('/auth/login', {
      data: {
        nationalId: voter.nationalId,
        password: voter.password,
      },
    });

    expect(loginResponse.status(), await loginResponse.text()).toBe(200);

    const loginData = await loginResponse.json();
    expect(loginData.token).toEqual(expect.any(String));

    return loginData.token;
  });
  
  // 4th step: ผู้มีสิทธิเลือกตั้งเรียกดูรายชื่อผู้สมัคร
  const candidatesRes = await test.step('ผู้มีสิทธิเลือกตั้งเรียกดูรายชื่อผู้สมัคร', () =>
    request.get('/me/candidates', {
    headers: { Authorization: `Bearer ${accessToken}` },
      }),
  );
    // 5th step: ตรวจสอบรายชื่อผู้สมัครรับเลือกตั้งจากข้อมูล seed
  await test.step('ผู้มีสิทธิเลือกตั้งเห็นรายชื่อผู้สมัครในเขตเลือกตั้ง CM-2', async () => {
    expect(candidatesRes.status(), await candidatesRes.text()).toBe(200);
    expect(await candidatesRes.json()).toEqual([
    { id: expect.any(Number), number: 1, name: 'อนันต์ ศรีสุข', party: 'พรรคดอยสุเทพ', selected: false },
    { id: expect.any(Number), number: 2, name: 'มาลี วงศ์คำ', party: 'พรรคแม่ปิง', selected: false },
  ]);
});

  
});
