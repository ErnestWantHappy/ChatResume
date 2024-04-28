import { useRef } // 从React库中引入useRef Hook，用于创建可更新并保持状态的引用对象
from "react";
import ErrorPage from "./ErrorPage"; // 引入错误页面组件
import '../index.css'; // 引入全局样式文件

import { useNavigate } from "react-router-dom";
import Docxtemplater from 'docxtemplater'; // 导入Docxtemplater库，用于处理和生成Word文档
import PizZip from 'pizzip'; // 导入PizZip库，用于读取和操作ZIP格式文件内容
import PizZipUtils from 'pizzip/utils/index.js'; // 导入PizZipUtils工具模块，提供获取远程资源内容的方法
import { saveAs } from 'file-saver'; // 导入file-saver库，用于浏览器环境下保存文件到本地
import expressionParser from 'docxtemplater/expressions'; // 导入Docxtemplater表达式解析器模块
import ImageModule from 'docxtemplater-image-module-free'
// 定义一个加载文件的异步辅助函数，使用PizZipUtils从指定URL获取文件二进制内容
function loadFile(url, callback) {
  PizZipUtils.getBinaryContent(url, callback);
}

const Resume = ({ result }) => {
  const componentRef = useRef(); // 使用useRef创建一个可更新的引用对象，可用于绑定元素节点或保存变量
  const navigate = useNavigate();
  
  // 定义一个函数，将换行符替换为HTML中的换行标签<br/>
  const replaceWithBr = (string) => {
    return string.replace(/\n/g, "<br/>"); // 将字符串中的所有'\n'字符替换为'<br/>'以在HTML中展示换行
  };
  const db = JSON.parse(localStorage.getItem('formValues'));

  // 检查结果对象是否为空，如果为空则返回错误页面组件
  if (JSON.stringify(result) === "{}") {
    return <ErrorPage />;
  }
  const returnBtnClick=()=>{
    navigate("/home1");
  }

  // 定义一个点击事件处理器，用于触发下载已填充数据的新Word文档
  const saveBtnClick = () => {
    // 加载模板文件（example0.docx）
    loadFile(
      '/example.docx',
      function (error, content) {
        if (error) {
          throw error; // 如果加载过程中发生错误，则抛出异常
        }
        result.objective=result.objective.replace(/^\n+/, '').replace(/\n{2,}/g, '\n');
        result.keypoints=result.keypoints.replace(/^\n+/, '').replace(/\n{2,}/g, '\n');
        result.jobResponsibilities=result.jobResponsibilities.replace(/^\n+/, '').replace(/\n{2,}/g, '\n');
        const imageOpts = {
		      getImage: function(tagValue, tagName) {
		        return new Promise(function (resolve, reject) {
		          PizZipUtils.getBinaryContent(tagValue, function (error, content) {
		            if (error) {
		              return reject(error);
		            }
		            return resolve(content);
		          });
		        });
		      },
		      getSize : function (img, tagValue, tagName) {
		        // FOR FIXED SIZE IMAGE :
		        return [120, 140];
		      }
		    }
        console.log(result);
        var imageModule = new ImageModule(imageOpts);
        
        // 创建一个新的PizZip实例来解压和操作Word文档内容
        const zip = new PizZip(content);

        // 创建一个新的Docxtemplater实例，并配置段落循环、换行支持及表达式解析器
        const doc = new Docxtemplater(zip, {
          paragraphLoop: true, // 允许在段落中循环数据
          linebreaks: true, // 自动转换换行符
          parser: expressionParser,
          modules: [imageModule],
        });
        
        console.log(db);
        // 渲染模板，传入实际的数据对象
        doc.renderAsync({
          image: result.image_url,
          result,
          db
        }).then(function () {
          // 生成新的填充了数据的Word文档内容，以Blob形式输出
          const out = doc.getZip().generate({
              type: "blob",
              mimeType: 'application/vnd.openxmlformatsofficedocument.wordprocessingml.document',
          });
          saveAs(out, "generated.docx");
        });
      }
    );
  };

  return (
    <>
      <main className="container" ref={componentRef}>
        <div className="container-inner">
        <header className="header">
          <div className="header-left">
            <div className="left-top">
              <div className="left-top-bg">
                <div className="left-top-name">{result.fullName}</div>
                <div>求职意向:{result.currentPosition}</div> 
              </div>
              <div className="Triangle"></div>
            </div>
            <div className="left-foot">
              <div>
                <div>出生年月:{db.birth}</div>
                <div>毕业院校:{db.school}</div>
                <div>工作时长:{result.currentLength}年</div>
              </div>
              <div>
                <div>手机:{db.phone}</div>
                <div>专业:{db.major}</div>
                <div>技能:{db.currentTechnologies}</div>
              </div>
              <div className="item3-foot">
                <div>邮箱:{db.email}</div>
                <div>学历:{db.edu}</div>
              </div>
            </div>
          </div>
          <div>
            <img src={result.image_url} alt={result.fullName} className='resumeImage' />
          </div>
        </header>
        <div className='resumeBody'>
            <div className="item-foot">
              <div className="item-top">
                <div className="item-top-left">
                  <div className="item-text">
                    <img src='./2.png' alt={"zdx"} className='item-image' />
                    <div>个人技能</div>
                  </div>
                  <div className="item-tri"></div>
                </div>
                <div className="item-line"></div>
              </div>
              <p dangerouslySetInnerHTML={{__html:replaceWithBr(result.keypoints)}} className='resumeBodyContent' />
            </div>
            <div className="item-foot">
              <div className="item-top">
                <div className="item-top-left">
                  <div className="item-text">
                    <img src='./3.png' alt={"zdx"} className='item-image' />
                    <div>工作经历</div>
                  </div>
                  <div className="item-tri"></div>
                </div>
                <div className="item-line"></div>
              </div>
              {result.workHistory.map((work)=>(
                    <p className='resumeBodyContent-mini' key={work.name}>
                      <span style={{fontWeight:"bold"}}>{work.name}</span> - {work.position}
                    </p>
                ))}
            </div>
            <div className="item-foot">
              <div className="item-top">
                <div className="item-top-left">
                  <div className="item-text">
                    <img src='./4.png' alt={"zdx"} className='item-image' />
                    <div>实践心得</div>
                  </div>
                  <div className="item-tri"></div>
                </div>
                <div className="item-line"></div>
              </div>
              <p dangerouslySetInnerHTML={{__html:replaceWithBr(result.jobResponsibilities)}}  className="resumeBodyContent" />
            </div>
            <div className="item-foot">
              <div className="item-top">
                <div className="item-top-left">
                  <div className="item-text">
                    <img src='./5.png' alt={"zdx"} className='item-image' />
                    <div>自我评价</div>
                  </div>
                  <div className="item-tri"></div>
                </div>
                <div className="item-line"></div>
              </div>
              <p dangerouslySetInnerHTML={{__html:replaceWithBr(result.objective)}} className='resumeBodyContent' />
            </div>
            
        </div>
        </div>
        <div className="saveBtn" onClick={saveBtnClick}>下载/Download</div>
        <div className="returnBtn" onClick={returnBtnClick}></div>
      </main>
    </>
  );
};

export default Resume;
