import {
  CartItem,
  ServiceType,
  useGetMyCartQuery,
  useRemoveCartItemMutation,
} from '#/generated/schemas';
import { NO_IMAGE } from '#/shared/utils/constant';
import { formatCurrency, showError, showSuccess } from '#/shared/utils/tools';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';
import {
  Card,
  Checkbox,
  Col,
  Empty,
  Image,
  Modal,
  Row,
  Skeleton,
  Tooltip,
  Typography,
} from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateServiceContract } from '#/pages/Client/Cart/CreateServiceContract';

const CartStyles = styled.div`
  .ant-checkbox-wrapper {
    display: flex;
    align-items: center;

    & > span:nth-of-type(2) {
      width: 100%;
    }
  }

  .anticon-delete {
    color: black;
    font-size: 20px;
    font-weight: bold;
    cursor: pointer;

    &:hover {
      color: red;
    }
  }

  .ant-image {
    width: 100% !important;
    height: 100px;
    padding: 0 10px;
    border-radius: 5px;

    .ant-image-img {
      border-radius: 0.5rem;
    }
  }

  .ant-card {
    border-radius: 0.5rem !important;
  }
`;

export function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [checkAll, setCheckAll] = useState(false);
  const [indeterminate, setIndeterminate] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);
  const { loading, refetch } = useGetMyCartQuery({
    fetchPolicy: 'cache-and-network',
    onCompleted: data => {
      setCartItems(data.getMyCart.cartItems as CartItem[]);
    },
  });

  const [removeCartItem, { loading: removeLoading }] =
    useRemoveCartItemMutation({
      onCompleted: () => {
        showSuccess('Xóa sản phẩm thành công');
        refetch();
      },
      onError: error => {
        showError(error);
      },
    });

  const onCheckAllChange = (e: CheckboxChangeEvent) => {
    setSelectedItems(
      e.target.checked
        ? cartItems.filter(item => !!item?.isAvailable).map(item => item.id)
        : [],
    );
    setIndeterminate(false);
    setCheckAll(e.target.checked);
  };

  const onChange = (checkedValues: CheckboxValueType[]) => {
    setSelectedItems(checkedValues as string[]);
    setIndeterminate(
      !!checkedValues.length &&
        checkedValues.length <
          cartItems.filter(item => item?.isAvailable).length,
    );
    setCheckAll(checkedValues.length === cartItems.length);
  };

  useEffect(() => {
    const total = selectedItems.reduce((total, item) => {
      const cartItem = cartItems.find(itemCart => itemCart.id === item);
      const itemPrice = cartItem
        ? cartItem?.amount *
          Number(cartItem?.serviceItem?.price) *
          (dayjs(cartItem?.hireEndDate).diff(dayjs(cartItem?.hireDate), 'day') +
            1)
        : 0;
      return total + itemPrice;
    }, 0);
    setTotalPrice(total);
  }, [selectedItems]);

  return (
    <CartStyles>
      <Row className="mx-auto  max-w-container px-4 pt-8" gutter={[16, 16]}>
        <Col lg={16} md={24} className="drop-shadow-2xl">
          <Card
            title={
              <Typography.Title level={3} className="text-[#f97316]">
                CHI TIẾT DANH SÁCH ĐĂNG KÍ
              </Typography.Title>
            }
            bordered={true}
          >
            <Skeleton loading={loading || removeLoading}>
              {cartItems?.length > 0 ? (
                <Row>
                  <Col span={24}>
                    <Row
                      gutter={[16, 16]}
                      className="my-3 rounded border border-solid border-slate-200 p-3"
                    >
                      <Col span={10} className="flex items-center">
                        <Checkbox
                          indeterminate={indeterminate}
                          onChange={onCheckAllChange}
                          checked={checkAll}
                        >
                          <Typography.Text className="font-bold text-black">{`Tất cả (${
                            cartItems.filter(item => item?.isAvailable).length
                          } sản phẩm)`}</Typography.Text>
                        </Checkbox>
                      </Col>
                      <Col span={3} className="text-center">
                        <Typography.Text className="font-bold text-black">
                          {' '}
                          Số lượng
                        </Typography.Text>
                      </Col>
                      <Col span={3} className="text-center">
                        <Typography.Text className="font-bold text-black">
                          {' '}
                          Đơn giá
                        </Typography.Text>
                      </Col>
                      <Col span={4} className="text-center">
                        <Tooltip
                          title={'Đơn giá x Số lượng x Số ngày thuê'}
                          placement="top"
                        >
                          <Typography.Text className="font-bold text-black">
                            {' '}
                            Thành tiền
                          </Typography.Text>
                        </Tooltip>
                      </Col>
                      <Col span={4} className="text-center">
                        <Typography.Text className="font-bold text-black">
                          Xóa
                        </Typography.Text>
                      </Col>
                    </Row>
                    <Row>
                      <Checkbox.Group
                        onChange={onChange}
                        value={selectedItems}
                        className="w-full"
                      >
                        {cartItems.map((item: CartItem, index: number) => {
                          return (
                            <Row
                              key={index}
                              className={`my-3 rounded border border-solid border-slate-200 p-3 ${
                                !item.isAvailable ? 'opacity-70' : ''
                              }`}
                            >
                              <Col span={10} className="w-full">
                                <Checkbox
                                  value={item.id}
                                  disabled={!item?.isAvailable}
                                >
                                  <Row className=" flex w-full items-center justify-center">
                                    <Col span={10}>
                                      <Image
                                        preview={!!item?.isAvailable}
                                        src={
                                          item?.serviceItem?.service
                                            ?.images?.[0] || NO_IMAGE
                                        }
                                        width={100}
                                        height={100}
                                      />
                                    </Col>
                                    <Col span={14}>
                                      <Row className="my-2">
                                        <Typography.Text
                                          className="font-bold uppercase text-black hover:text-[#f97316]"
                                          onClick={() => {
                                            if (
                                              item.serviceItem.service.type ===
                                              ServiceType.Device
                                            ) {
                                              navigate(
                                                `/device/${item.serviceItem.service.id}`,
                                              );
                                            } else {
                                              navigate(
                                                `/human-event/${item.serviceItem.service.id}`,
                                              );
                                            }
                                          }}
                                        >
                                          {item.serviceItem.name}
                                        </Typography.Text>
                                      </Row>
                                      <Row className="my-2">
                                        <Typography.Text className="mr-3 font-bold text-black">
                                          Thời gian thuê:
                                        </Typography.Text>
                                        <Typography.Text className="text-black">
                                          {`${dayjs(item.hireDate).format(
                                            'DD/MM/YYYY',
                                          )} - ${dayjs(item.hireEndDate).format(
                                            'DD/MM/YYYY',
                                          )}`}
                                        </Typography.Text>
                                      </Row>
                                    </Col>
                                  </Row>
                                </Checkbox>
                              </Col>
                              <Col
                                span={3}
                                className=" flex w-full items-center justify-center"
                              >
                                <Typography.Text className="text-black">
                                  {item.amount}
                                </Typography.Text>
                              </Col>
                              <Col
                                span={3}
                                className=" flex w-full items-center justify-center"
                              >
                                <Typography.Text className="text-black">
                                  {item.serviceItem.price
                                    ? formatCurrency(item.serviceItem.price)
                                    : '-'}
                                </Typography.Text>
                              </Col>
                              <Col
                                span={4}
                                className="flex w-full items-center justify-center"
                              >
                                <Typography.Text className="text-black ">
                                  {item.serviceItem.price
                                    ? formatCurrency(
                                        item.serviceItem.price *
                                          item.amount *
                                          (dayjs(item.hireEndDate).diff(
                                            dayjs(item.hireDate),
                                            'day',
                                          ) +
                                            1),
                                      )
                                    : '-'}
                                </Typography.Text>
                              </Col>
                              <Col
                                span={4}
                                className="flex w-full items-center justify-center"
                              >
                                <Typography.Text>
                                  <Tooltip title={'Xóa'}>
                                    <DeleteOutlined
                                      onClick={() => {
                                        Modal.confirm({
                                          title:
                                            'Bạn có chắc chắn muốn xóa sản phẩm này?',
                                          icon: <ExclamationCircleOutlined />,
                                          onOk() {
                                            removeCartItem({
                                              variables: {
                                                cartItemId: item.id,
                                              },
                                            });

                                            if (
                                              selectedItems.includes(item.id)
                                            ) {
                                              setSelectedItems(
                                                selectedItems.filter(
                                                  selectedItem =>
                                                    selectedItem !== item.id,
                                                ),
                                              );
                                            }
                                          },
                                        });
                                      }}
                                    />
                                  </Tooltip>
                                </Typography.Text>
                              </Col>
                              {!item.isAvailable && (
                                <Col span={24} className={'my-2 ml-8'}>
                                  <Typography.Text
                                    className={
                                      'my-2 rounded-2xl border-[1px] border-solid border-[#000] bg-[#ccc] p-2 text-black '
                                    }
                                  >
                                    Không khả dụng.
                                  </Typography.Text>
                                </Col>
                              )}
                            </Row>
                          );
                        })}
                      </Checkbox.Group>
                    </Row>
                  </Col>
                </Row>
              ) : (
                <Empty />
              )}
            </Skeleton>
          </Card>
        </Col>
        <Col lg={8} md={24} className="drop-shadow-2xl">
          <Card
            title={
              <Typography.Title level={3} className="text-[#f97316]">
                CHI TIẾT THANH TOÁN
              </Typography.Title>
            }
            bordered={true}
          >
            <Row gutter={[8, 8]}>
              {selectedItems.length > 0 ? (
                <Col span={24}>
                  {selectedItems.map((item: string, index: number) => {
                    const cartItem = cartItems.find(
                      cartItem => cartItem.id === item,
                    );
                    return (
                      <Row key={index} className="border-b-[1px] py-4">
                        <Col span={12}>
                          {
                            <Typography.Text className="font-bold uppercase text-black">
                              {cartItem?.serviceItem?.name}
                            </Typography.Text>
                          }
                        </Col>
                        <Col span={3} className="text-center">
                          <Typography.Text className="text-black">
                            x{cartItem?.amount}
                          </Typography.Text>
                        </Col>{' '}
                        <Col span={3} className="text-center">
                          <Typography.Text className="text-black">
                            x
                            {dayjs(cartItem?.hireEndDate).diff(
                              cartItem?.hireDate,
                              'day',
                            ) + 1}
                          </Typography.Text>
                        </Col>
                        <Col span={6} className="text-center">
                          <Typography.Text className="float-right text-black">
                            {formatCurrency(cartItem?.serviceItem.price || 0)}
                          </Typography.Text>
                        </Col>
                      </Row>
                    );
                  })}
                </Col>
              ) : (
                <></>
              )}
              <Col
                span={24}
                className="flex w-full justify-between py-4 text-lg"
              >
                <Typography.Text className="font-bold text-black">
                  Tổng tiền:
                </Typography.Text>
                <Typography.Text className="font-bold text-black text-[#f97316]">
                  {formatCurrency(totalPrice)}
                </Typography.Text>
              </Col>
              <Col span={24} className="my-4">
                <CreateServiceContract
                  onChange={refetch}
                  selectedCartItems={selectedItems}
                  cartItems={cartItems}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </CartStyles>
  );
}
