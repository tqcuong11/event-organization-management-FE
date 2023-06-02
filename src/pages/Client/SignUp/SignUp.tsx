import { Email, Password } from '#/assets/svg';
import { useSignUpMutation } from '#/generated/schemas';
import PrimaryButton from '#/shared/components/buttons/PrimaryButton';

import { showError } from '#/shared/utils/tools';
import { Col, Form, Input, Radio, Row, Typography } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SignUpForm = ({ className }: { className: string }) => {

  const [email, setEmail] = useState<string>('');
  const navigate = useNavigate();
  const [signUpMutation, { loading: signUpLoading }] = useSignUpMutation({
    onCompleted() {
      navigate(`/verify-code?email=${encodeURIComponent(email)}`);
    },
    onError: showError,
  });

  const handleSignUp = (input: any) => {
    const { confirm, ...data } = input;
    signUpMutation({
      variables: {
        input: data,
      },
    });
    setEmail(data.email);
  };
  return (
    <>
     
      <Form
        onFinish={handleSignUp}
        layout="vertical"
        className={`px-8 ${className}`}
        scrollToFirstError
      >   
        <Typography.Title className='w-full text-center py-3 mt-3' level={3}>ĐĂNG KÍ THÀNH VIÊN</Typography.Title>      
        <Row className="mt-10">
          <Col span={24}>
            <Form.Item
              name="email"
              label="Email"
              messageVariables={{ name: "" }}
              rules={[
                {
                  type: 'email',
                  required: true,
                },
              ]}
              
            >
              <Input
                prefix={
                  <span className="anticon mr-3">
                    <Email width={15} height={15} style={{color:"black !important"}}/>
                  </span>
                }
              />
            </Form.Item>
          </Col>
          <Col span={24} className="mt-4">
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input.Password
                prefix={
                  <span className="anticon mr-2">
                    <Password width={20} height={20} className="text-[black]" />
                  </span>
                }
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="confirm"
              label="Nhập lại mật khẩu"
              rules={[
                {
                  type: 'string',
                  required: true,
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }

                    return Promise.reject(
                      new Error("Mật khẩu không trùng khớp."),
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={
                  <span className="anticon mr-3">
                    <Password width={20} height={20} className="text-[black]" />
                  </span>
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="firstName"
              label="Họ và tên đệm"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="lastName"
              label="Tên"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="phoneNumber"
              label="Số điện thoại"
              rules={[
                {
                  len: 10,
                  message: "Số điện thoại không hợp lệ. Vui lòng nhập lại.",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={24} className="mt-6">
            <Form.Item>
              <PrimaryButton
                type="primary"
                htmlType="submit"
                block
                loading={signUpLoading}
              >
               Đăng kí
              </PrimaryButton>
            </Form.Item>
          </Col>
          <Col span={24} className="flex justify-center  mb-6">
            <span className="pr-3 text-black">Đã có tài khoản ? </span>
            <Link to="/sign-in" className="text-black hover:text-red-600 ">
               Đăng nhập
            </Link>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default SignUpForm;