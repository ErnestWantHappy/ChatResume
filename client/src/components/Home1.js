import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loading from './Loading';
import './Home1.scss';
import { Radio, Button, Form, Input, Upload, InputNumber, DatePicker, message } from 'antd';
import { PlusOutlined, UploadOutlined, MinusOutlined } from '@ant-design/icons';
import { Row, Col } from 'antd'; // 首先确保已导入Row和Col组件
import zhCN from 'antd/es/date-picker/locale/zh_CN'; // 引入中文包
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
// 定义简历创建组件
const Home1 = ({ setResult }) => {
    // 初始化加载状态为 false，当数据加载时设为 true
    const [loading, setLoading] = useState(false);
    const returnBtnClick=()=>{
        navigate("/");
      }

    // 初始化上传文件列表
    const [fileList, setFileList] = useState([]);

    // 使用 Ant Design 的 useForm Hook 创建表单实例并管理表单值
    const [form] = Form.useForm();

    // 获取页面导航对象，用于路由跳转
    const navigate = useNavigate();

    // 初始化公司信息数组，每个元素包含公司名称和职位信息
    const [companyInfo, setCompanyInfo] = useState([{ name: '', position: '' }]);

    // 控制创建简历样式风格的数字状态（0或1）
    const [createNum, setCreateNum] = useState(0);
    const [birth,setBirth]=useState('')

    // 在上传前将文件添加到文件列表，同时阻止默认上传行为
    const handleBeforeUpload = (file) => {
        if (fileList.length >= 1) { // 检查fileList长度是否超过1
            message.error('您只能上传一张图片');
            return false;
        }

        setFileList([...fileList, file]);
        return false; // 阻止默认上传行为
    };


    // 设置上传文件的相关属性
    const props = {
        onRemove: (file) => handleOnRemove(file),
        beforeUpload: handleBeforeUpload,
        fileList,
        maxCount: 1,
    };

    // 处理从文件列表中移除文件
    const handleOnRemove = (file) => {
        const newFileList = fileList.slice();
        const index = newFileList.indexOf(file);
        if (index !== -1) {
            newFileList.splice(index, 1);
            setFileList(newFileList);
        }
    };

    const onChange = (date, dateString) => {
        console.log(date, dateString);
        setBirth(dateString)
    };



    // 添加新的工作经历条目
    const handleAddCompany = () => {
        setCompanyInfo([...companyInfo, { name: '', position: '' }]);
    };

    // 删除指定索引的工作经历条目
    const handleRemoveCompany = (index) => {
        const list = [...companyInfo];
        list.splice(index, 1);
        setCompanyInfo(list);
    };

    // 监听简历样式风格的选择变化
    const onChangeRadio = (e) => {
        setCreateNum(e.target.value);
    };

    // 表单提交处理函数
    const onFinish = (values) => {
        console.log(values);
        values.birth=birth;
        localStorage.setItem('formValues', JSON.stringify(values));
        setLoading(true);

        // 构建 FormData 对象用于发送 POST 请求
        const formData = new FormData();
        fileList.forEach((file) => formData.append('headshotImage', file));

        // 将表单其他字段追加至 FormData
        formData.append("fullName", values.fullName);
        formData.append("currentPosition", values.currentPosition);
        formData.append("currentLength", values.currentLength);
        formData.append("currentTechnologies", values.currentTechnologies);
        formData.append("workHistory", JSON.stringify(values.companyInfo));

        // 发送请求创建简历
        axios.post("http://43.135.135.83:4000/resume/create", formData, {})
            .then((res) => {
                console.log(res)
                if(res.data.status==429){
                    message.error("系统访问次数过多，请等待30s");
                    return
                }
                if(res.data.status==200){
                    if (res.data.message) {
                        setResult(res.data.data);
                        navigate(createNum === 0 ? "/resume" : "/resume1");
                    }
                }else{
                    message.error("系统访问次数过多，请等待60s");
                }
                
            })
            .catch((error) => {
                console.error('Error in POST request:', error);
                // 可以在这里处理错误逻辑
                  message.error("系统出现未知错误，请联系系统开发者");
              })
            .finally(() => {
                setLoading(false);
              });
    };

    // 渲染工作经历部分，动态生成表单项
    const companyList = companyInfo.map((company, index) => (
        <div className="companyClass" key={index}>
            <Row gutter={[30, 0]}>
                <Col span={9}> <Form.Item
                    label="公司名称"
                    name={['companyInfo', index, 'name']}
                    rules={[{ required: true, message: '请输入公司名称' }]}
                >
                    <Input />
                </Form.Item></Col>
                <Col span={9}><Form.Item
                    label="公司职位"
                    name={['companyInfo', index, 'position']}
                    rules={[{ required: true, message: '请输入公司职位' }]}
                >
                    <Input />
                </Form.Item></Col>
                <Col span={3}>
                    {companyInfo.length - 1 === index && companyInfo.length < 4 && (
                        <Button className='addBtn' onClick={handleAddCompany} icon={<PlusOutlined />} />
                    )}
                </Col>
                <Col span={3}>{companyInfo.length > 1 && (
                    <Button className='removeBtn' onClick={() => handleRemoveCompany(index)} icon={<MinusOutlined />} />
                )}</Col>
            </Row>
        </div>
    ));

    // 当加载状态为真时显示加载指示器
    if (loading) return <Loading />;

    // 渲染主组件内容，包括表单、上传组件和样式选择器等
    return (
        <div className="home1">
            {/* 页面标题 */}
            <div className='homeTitle'>
                <h1>简历生成器</h1>
                <p>使用ChatGPT几秒钟生成一个简历</p>
            </div>

            {/* 表单主体，用Row和Col进行布局控制 */}
            <Form size='large' form={form} onFinish={onFinish} layout="vertical" initialValues={{ currentLength: 1 }}>
                <Row gutter={[30, 0]}>
                    <Col span={12}> {/* 每个Col占据12栅格，总共24栅格，正好一行两列 */}
                        {/* 姓名输入项 */}
                        <Form.Item
                            name="fullName"
                            label="姓名"
                            rules={[{ required: true, message: '请输入全名' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        {/* 当前职位输入项 */}
                        <Form.Item
                            name="currentPosition"
                            label="求职意向岗位"
                            rules={[{ required: true, message: '请输入意向职位' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[30, 0]}>
                    <Col span={12}> {/* 每个Col占据12栅格，总共24栅格，正好一行两列 */}
                        {/* 手机号输入项 */}
                        <Form.Item
                            name="phone"
                            label="手机号"
                            rules={[{ required: true, message: '请输入手机号' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        {/* 邮箱位输入项 */}
                        <Form.Item
                            name="email"
                            label="邮箱"
                            rules={[{ required: true, message: '请输入邮箱' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[30, 0]}>
                    <Col span={8}> {/* 每个Col占据12栅格，总共24栅格，正好一行两列 */}
                        {/* 学校输入项 */}
                        <Form.Item
                            name="school"
                            label="毕业院校"
                            rules={[{ required: true, message: '请输入学校' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        {/* 专业输入项 */}
                        <Form.Item
                            name="major"
                            label="专业"
                            rules={[{ required: true, message: '请输入专业' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        {/* 学历输入项 */}
                        <Form.Item
                            name="edu"
                            label="学历"
                            rules={[{ required: true, message: '请输入学历' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[30, 0]}>
                    <Col span={6}> {/* 每个Col占据12栅格，总共24栅格，正好一行两列 */}
                        {/* 出生年月输入项 */}
                        <Form.Item
                            name="birth"
                            label="出生年月"
                            rules={[{ required: true, message: '请输入出生年月' }]}
                        >
                            <DatePicker locale={zhCN} initialValues={dayjs('2002-04-20', 'YYYY-MM-DD')}  className='dateClass' onChange={onChange} picker="month" />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        {/* 工作年限输入项 */}
                        <Form.Item
                            name="currentLength"
                            label="实习/工作时长 (年)"
                            rules={[{ required: true, message: '请输入工作年限' }]}
                        >
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label="专业技能/技术" name="currentTechnologies" rules={[{ required: true, message: '请输入使用的技术' }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        {/* 照片上传组件 */}
                        <Form.Item label="照片">
                            <Upload   {...props}>
                                <Button icon={<UploadOutlined />}>选择文件</Button>
                            </Upload>
                        </Form.Item>
                    </Col>
                </Row>
                {/* 工作经历标题 */}
                <h2 >工作/实习经历</h2>
                {/* 工作经历列表 */}
                {companyList}
                <Row gutter={[30, 0]}>
                    <Col span={12}>
                        {/* 简历样式选择区域 */}
                        <div className="chooseFeng">
                            <div>选择简历样式风格：</div>
                            <Radio.Group onChange={onChangeRadio} value={createNum}>
                                <Radio value={0}>word版</Radio>
                                <Radio value={1}>web版</Radio>
                            </Radio.Group>
                        </div>
                    </Col>
                    <Col span={12}>
                        <Form.Item>
                            <Button
                                size="large"
                                type="primary"
                                htmlType="submit"
                                className="btnCreate"
                                disabled={fileList.length === 0}
                            >
                                创建简历
                            </Button>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
            <div className="returnBtn" onClick={returnBtnClick}></div>
        </div>
    );
};

export default Home1;
