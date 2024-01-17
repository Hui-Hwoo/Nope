import{u as L,j as r}from"./styled-components.browser.esm-97beecc9.js";import"./index-c013ead5.js";import"./_commonjsHelpers-725317a4.js";const D=L.button`
    border: 0;
    line-height: 1;
    font-size: 15px;
    cursor: pointer;
    font-weight: 700;
    font-weight: bold;
    border-radius: 3px;
    display: inline-block;
    padding: ${e=>e.size==="small"?"7px 25px 8px":e.size==="medium"?"9px 30px 11px":"14px 30px 16px"};
    color: ${e=>e.primary?"#1b116e":"#ffffff"};
    background-color: ${e=>e.primary?"#6bedb5":"#1b116e"};
    opacity: ${e=>e.disabled?.5:1};
    &:hover {
        background-color: ${e=>e.primary?"#55bd90":"#6bedb5"};
    }
    &:active {
        border: solid 2px #1b116e;
        padding: ${e=>e.size==="small"?"5px 23px 6px":e.size==="medium"?"7px 28px 9px":"12px 28px 14px"};
    }
`,a=({size:e,primary:M,disabled:$,text:k,onClick:q,...V})=>r(D,{type:"button",onClick:q,primary:M,disabled:$,size:e,...V,children:k});try{a.displayName="Button",a.__docgenInfo={description:"",displayName:"Button",props:{text:{defaultValue:null,description:"",name:"text",required:!1,type:{name:"string"}},primary:{defaultValue:null,description:"",name:"primary",required:!1,type:{name:"boolean"}},disabled:{defaultValue:null,description:"",name:"disabled",required:!1,type:{name:"boolean"}},size:{defaultValue:null,description:"",name:"size",required:!1,type:{name:"enum",value:[{value:'"small"'},{value:'"medium"'},{value:'"large"'}]}},onClick:{defaultValue:null,description:"",name:"onClick",required:!1,type:{name:"MouseEventHandler<HTMLButtonElement>"}}}}}catch{}const w={component:a,title:"Marbella/Button",argTypes:{}},t=e=>r(a,{"data-testId":"InputField-id",...e});t.args={primary:!0,disabled:!1,text:"Primary"};const s=e=>r(a,{"data-testId":"InputField-id",...e});s.args={primary:!1,disabled:!1,text:"Secondary"};const d=e=>r(a,{"data-testId":"InputField-id",...e});d.args={primary:!1,disabled:!0,text:"Disabled"};const i=e=>r(a,{"data-testId":"InputField-id",...e});i.args={primary:!0,disabled:!1,size:"small",text:"Small"};const o=e=>r(a,{"data-testId":"InputField-id",...e});o.args={primary:!0,disabled:!1,size:"medium",text:"Medium"};const l=e=>r(a,{"data-testId":"InputField-id",...e});l.args={primary:!0,disabled:!1,size:"large",text:"Large"};var n,p,u;t.parameters={...t.parameters,docs:{...(n=t.parameters)==null?void 0:n.docs,source:{originalSource:'args => <Button data-testId="InputField-id" {...args} />',...(u=(p=t.parameters)==null?void 0:p.docs)==null?void 0:u.source}}};var m,c,g;s.parameters={...s.parameters,docs:{...(m=s.parameters)==null?void 0:m.docs,source:{originalSource:'args => <Button data-testId="InputField-id" {...args} />',...(g=(c=s.parameters)==null?void 0:c.docs)==null?void 0:g.source}}};var b,x,y;d.parameters={...d.parameters,docs:{...(b=d.parameters)==null?void 0:b.docs,source:{originalSource:'args => <Button data-testId="InputField-id" {...args} />',...(y=(x=d.parameters)==null?void 0:x.docs)==null?void 0:y.source}}};var f,I,S;i.parameters={...i.parameters,docs:{...(f=i.parameters)==null?void 0:f.docs,source:{originalSource:'args => <Button data-testId="InputField-id" {...args} />',...(S=(I=i.parameters)==null?void 0:I.docs)==null?void 0:S.source}}};var B,F,z;o.parameters={...o.parameters,docs:{...(B=o.parameters)==null?void 0:B.docs,source:{originalSource:'args => <Button data-testId="InputField-id" {...args} />',...(z=(F=o.parameters)==null?void 0:F.docs)==null?void 0:z.source}}};var _,h,v;l.parameters={...l.parameters,docs:{...(_=l.parameters)==null?void 0:_.docs,source:{originalSource:'args => <Button data-testId="InputField-id" {...args} />',...(v=(h=l.parameters)==null?void 0:h.docs)==null?void 0:v.source}}};const C=["Primary","Secondary","Disabled","Small","Medium","Large"];export{d as Disabled,l as Large,o as Medium,t as Primary,s as Secondary,i as Small,C as __namedExportsOrder,w as default};
