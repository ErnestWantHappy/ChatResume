import { useRef } from "react";
import ErrorPage from "./ErrorPage";
import './Resume1.scss';

import { useNavigate } from "react-router-dom";
// let result = {
//   fullName: "郑东旭",
//   currentPosition: "前端工程师",
//   currentLength: "1",
//   currentTechnologies: "react,js,css,html",
//   image_url: "http://152.136.42.72:8008/head.jpg",
//   workHistory: [
//     {
//       name: "早稻科技有限公司",
//       position: "前端实习生",
//     },
//   ],
//   //简介
//   objective: "热情活泼的我，郑东旭，一年前端开发工程师实践经验。能够运用react,.vue,jquery三大前端技术实现功能性和效能上的量身打造；准确、出色地保障应用产品的使用者体验。关注新技术发展，不断学习进步HTML5/CSS3等前端相关协作以将产品样式与客户要求吻合。",
//   //工作简介
//   jobResponsibilities: '在早稻科技有限公司，我负责了多项前端开发工作，并且始终遵守客户要求的工作准则。在一年里，我根据公司的正常流程实施了所有任务和目标。我总是尝试通过使用不同的开发技术来优化代码和流体度。在一年内，我也协助优化前端项目UI/UX界面。积极寻找和应用新方法、新工具来不断优化WebApp性能。集中心气勤勤奋上进使得从原理到番萝都能一看便明，点子明快切合能耐度大处皆有表现；理念独特、追求重效益；团卦意识、团队凝到归气味都处处飘逸',
//   //工作技能
//   keypoints: "1.精通React,能够快速搭建高质量的单页应用。2.能够使用Vue构建可伸缩性的项目。3.具有对MySOL、PostgreSQL等数据库的实践经验并能创建优化后端sql语句以便于前端业务运行良好。4.拥有JavaScript先进开发方法，如ES67,AJAX's,JSONP与HTTP历史相关中间件开发解决方案集成。5.具有Bootstrap,AngularJS,KnockoutJS和Grunt之间css布局/标注专家精通。6.大学所修css/SASS/LESS移动WEB应用工作流无障碍并把HTML5API应用到新特性上的经验几",
// };


const Resume1 = ({result}) => {
  console.log(result);
  const navigate = useNavigate();
  let keyPointsArr = result.keypoints.split(/\d+\./);
  keyPointsArr.shift(); // 移除第一个空元素
  console.log(keyPointsArr);
  const componentRef = useRef();// useRef()可以用来绑定元素节点和保存变量
  const replaceWithBr = (string) => {
    return string.replace(/\n/g, "<br/>");//把\n 转换成 <br/>
  };
  const returnBtnClick=()=>{
    navigate("/home1");
  }
  // returns an error page if the result object is empty
  if (JSON.stringify(result) === "{}") {
    return <ErrorPage />;
  }
  return (
    <>
      <div className="con1" ref={componentRef}>
        <div className="top">
          <div className="topInner">
            <img src={result.image_url} className="headPicture" alt="" />
            <h2>{result.fullName}</h2>
            <h4>{result.currentPosition}</h4>
          </div>
        </div>
        <div className="content">
          <div className="brief">
            <div className="brief-left">
              <div className="title">个人简介</div>
              <div>姓名:{result.fullName}</div>
              <div>工作时间:{result.currentLength}</div>
              <div>专业技能:{result.currentTechnologies}</div>
            </div>
            <div className="brief-right">{result.objective}</div>
          </div>
          <div className="keypoints">
            <div className="key-title">个人技能</div>
            <div className="key-content">
              {keyPointsArr.map((item, index) => (
                <p key={index}>{index + 1}. {item}</p>
              ))}
            </div>
          </div>
          <div className="work">
            <div className="work-left">
              <div className="title">工作简介</div>
              <div>{result.jobResponsibilities}</div>
            </div>
            <div className="work-right">
              <div className="title">工作经历</div>
              {result.workHistory.map((item, index) => (
                <div key={index}>
                  <div className="company">{index+1}.{item.name}——{item.position}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="returnBtn" onClick={returnBtnClick}></div>
      </div>
    </>
  );
};

export default Resume1;
