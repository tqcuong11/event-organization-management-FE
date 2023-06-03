import { Avatar, Dropdown, Menu, Skeleton, Typography } from 'antd';

import { ArrowDownSVG, LogoutSVG, UserAccountSVG } from '#/assets/svg';
import { useGetMeQuery } from '#/generated/schemas';

import { userVar } from '#/graphql/cache';

import { clearLocalStorage } from '#/shared/utils/token';
import { ROLE } from '#/shared/utils/type';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { USER_DEFAULT_IMAGE } from '#/shared/utils/constant';
import { ShoppingCartOutlined } from '@ant-design/icons';
import CartIcon from './Cart';

type MenuType = {
  key: string | number;
  to?: string;
  icon: JSX.Element;
  title: string;
  href?: string[];
};

const userMenus: MenuType[] = [
  {
    key: 'my-profile',
    to: '/profile',
    icon: <UserAccountSVG width={20} height={20} />,
    title: 'Thông tin cá nhân',
    href: ['/user/profile'],
  },
  {
    key: 'cart',
    to: '/cart',
    icon: <UserAccountSVG width={20} height={20} />,
    title: 'Quản lý giỏ hàng',
    href: ['/cart'],
  },
  {
    key: 'user-contract',
    to: '/contract-management',
    icon: <UserAccountSVG width={20} height={20} />,
    title: 'Quản lý hợp đồng',
    href: ['/user/contract-management'],
  },
  {
    key: 'user-event-request',
    to: '/event-request',
    icon: <UserAccountSVG width={20} height={20} />,
    title: 'Quản lý yêu cầu sự kiện ',
    href: ['/user/event-request'],
  },

  {
    key: 'logout',
    icon: <LogoutSVG width={20} height={20} />,
    title: 'Đăng xuất',
  },
];

const adminMenus: MenuType[] = [
  {
    key: 'my-profile',
    to: '/profile',
    icon: <UserAccountSVG width={20} height={20} />,
    title: 'Thông tin cá nhân',
    href: ['/profile'],
  },
  {
    key: 'admin-dashboard',
    to: '/admin/user-management',
    icon: <UserAccountSVG width={20} height={20} />,
    title: 'Vào trang quản trị',
    href: ['/admin'],
  },
  {
    key: 'logout',
    icon: <LogoutSVG width={20} height={20} />,
    title: 'Đăng xuất',
  },
];

function AccountInfo() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [menus, setMenus] = useState<MenuType[]>(userMenus);
  const [showName, setShowName] = useState('');

  const logout = () => {
    clearLocalStorage();
    window.location.reload();
    navigate('/');
  };

  const { data, loading } = useGetMeQuery({
    onCompleted(data) {
      userVar(data?.getMe);
      setShowName(`${data?.getMe?.firstName} ${data?.getMe?.lastName}` ?? '');
    },
  });

  useEffect(() => {
    if (data?.getMe.role.name === ROLE.ADMIN) {
      setMenus(adminMenus);
    }
  }, [data]);
  return (
    <div className="flex justify-between">
      <CartIcon itemCount={1} />
      <Dropdown
        overlay={
          <Skeleton loading={loading}>
            <Menu
              className="bg-[#242424] "
              items={menus.map(menu => ({
                key: menu.key,
                label: (
                  <span
                    onClick={menu.to ? () => navigate(`${menu.to}`) : logout}
                    className={`flex items-center gap-3 ${
                      menu?.href?.includes(pathname)
                        ? 'text-[rgb(249 115 22)]'
                        : ''
                    } text-2xl`}
                  >
                    {menu?.href?.includes(pathname) && (
                      <div className="h-2 w-2 rounded-full" />
                    )}
                    {menu.icon}
                    {menu.title}
                  </span>
                ),
              }))}
            />
          </Skeleton>
        }
        placement="bottomRight"
      >
        <div className="flex items-center justify-end gap-2 pb-2">
          <Avatar
            className="bg-slate-100"
            size={45}
            src={data?.getMe?.avatar ?? USER_DEFAULT_IMAGE}
          />

          <ArrowDownSVG width={16} height={16} />
        </div>
      </Dropdown>
    </div>
  );
}

export default AccountInfo;
