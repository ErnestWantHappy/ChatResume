import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";
import "../index.css";
import { Radio ,Button} from 'antd';
const Home = ({ setResult }) => {
  const [createNum, setCreateNum] = useState(0); //点击的是哪个按钮
  const [fullName, setFullName] = useState(""); //全名
  const [currentPosition, setCurrentPosition] = useState(""); //现在的职位
  const [currentLength, setCurrentLength] = useState(1); //实习了几年
  const [currentTechnologies, setCurrentTechnologies] = useState(""); //拥有的技术
  const [headshot, setHeadshot] = useState(null); //头像
  const [companyInfo, setCompanyInfo] = useState([{ name: "", position: "" }]); //公司信息
  const [loading, setLoading] = useState(false); //页面加载业务，setLoading(true)是加载中，初始化false不加载
  const navigate = useNavigate(); //使用useNavigate 进行路由的跳转以及传参，并且获取参数。

  // 在公司列表中添加一个空的元素供用户输入
  const handleAddCompany = () => {
    setCompanyInfo([...companyInfo, { name: "", position: "" }]);
  };

  // 移除公司列表中的某一个公司
  const handleRemoveCompany = (index) => {
    const list = [...companyInfo];
    list.splice(index, 1); //从index位置删除一个元素
    setCompanyInfo(list);
  };
 
  const onChange = (e) => {
    console.log('radio checked', e.target.value);
    setCreateNum(e.target.value);
  };

  // 用户输入公司信息
  const handleUpdateCompany = (e, index) => {
    const { name, value } = e.target;
    const list = [...companyInfo];
    list[index][name] = value;
    setCompanyInfo(list);
  };

  //提交表单
  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log(companyInfo);
    const formData = new FormData();
    formData.append("headshotImage", headshot, headshot.name);
    formData.append("fullName", fullName);
    formData.append("currentPosition", currentPosition);
    formData.append("currentLength", currentLength);
    formData.append("currentTechnologies", currentTechnologies);
    formData.append("workHistory", JSON.stringify(companyInfo)); //JSON.stringify()【从一个对象中解析出字符串】
    console.log("formData", formData);
    axios
      .post("http://43.135.135.83:4000/resume/create", formData, {})
      .then((res) => {
        if (res.data.message) {
          // updates the result object
          setResult(res.data.data);
          console.log("res.data.message", res.data.message);
          if(createNum==0){
            navigate("/resume");
          }else{
            navigate("/resume1")
          }
          
        }
      })
      .catch((err) => console.error(err));
    setLoading(true);
  };

  // Renders the Loading component you submit the form
  if (loading) return <Loading />;

  return (
    <div className="app">
      <h1>简历生成器</h1>
      <p>使用ChatGPT几秒钟生成一个简历</p>
      {/* encType="multipart/form-data"指编码类型由多部分构成 */}
      <form
        method="POST"
        encType="multipart/form-data"
        onSubmit={handleFormSubmit}
      >
        {/* React DOM 使用 className 和 htmlFor 来做对应的属性，就是点击这个标签就哭呀定位到input标签直接输入 */}
        <label htmlFor="fullName">输入你的全名</label>
        <input
          type="text"
          required
          name="fullName"
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <div className="nestedContainer">
          <div className="div1">
            <label htmlFor="currentPosition">现在的职位</label>
            <input
              type="text"
              required
              name="currentPosition"
              id="currentPosition"
              value={currentPosition}
              onChange={(e) => setCurrentPosition(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="currentLength">工作了多久 (年)</label>
            <input
              type="number"
              required
              className="currentInput"
              value={currentLength}
              onChange={(e) => setCurrentLength(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="currentTechnologies">使用的技术</label>
            <input
              type="text"
              required
              name="currentTechnologies"
              id="currentTechnologies"
              className="currentInput"
              value={currentTechnologies}
              onChange={(e) => setCurrentTechnologies(e.target.value)}
            />
          </div>
        </div>
        <label htmlFor="photo">请上传你的大头照 (png,jpeg)</label>
        <input
          type="file"
          name="photo"
          id="photo"
          required
          accept="image/x-png,image/jpeg"
          onChange={(e) => setHeadshot(e.target.files[0])}
        />
        <h3>你曾经工作过的公司</h3>
        {companyInfo.map((company, index) => (
          <div className="nestedContainer" key={index}>
            <div className="companies">
              <label htmlFor="name">公司名称</label>
              <input
                type="text"
                name="name"
                required
                onChange={(e) => handleUpdateCompany(e, index)}
              />
            </div>
            <div className="companies">
              <label htmlFor="position">公司职位</label>
              <input
                type="text"
                name="position"
                required
                onChange={(e) => handleUpdateCompany(e, index)}
              />
            </div>
            <div className="btn_group">
              {companyInfo.length - 1 === index && companyInfo.length < 4 && (
                <button id="addBtn" onClick={handleAddCompany}>
                  Add
                </button>
              )}
              {companyInfo.length > 1 && (
                <button
                  id="deleteBtn"
                  onClick={() => handleRemoveCompany(index)}
                >
                  Del
                </button>
              )}
            </div>
          </div>
        ))}
        <div className="chooseFeng">
          <div>选择简历样式风格：</div>
          <Radio.Group onChange={onChange} value={createNum}>
            <Radio value={0}>简约</Radio>
            <Radio value={1}>清新</Radio>
          </Radio.Group>
        </div>
        {/* <button >1</button> */}
        <Button  size="large" onClick={handleFormSubmit} className="btnCreate">
             创建简历
          </Button>
      </form>
    </div>
  );
};
export default Home;
