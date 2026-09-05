import React from "react";
import { Link } from "react-router-dom";
import { FiInstagram, FiArrowUpRight } from "react-icons/fi";

export default function Footer(){
  return <footer style={{background:"#1c1b18",color:"#f5f0e8"}}>
    <div style={{width:"min(1180px,calc(100% - 40px))",margin:"auto",padding:"65px 0 25px",display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:50}}>
      <div><div style={{fontFamily:"Georgia,serif",fontSize:28,letterSpacing:".12em"}}>SENSATIONAL</div><div style={{fontSize:9,letterSpacing:".34em",marginTop:7,color:"#c39a54"}}>INTERIORS</div><p style={{maxWidth:390,color:"#bdb8b0",lineHeight:1.7,marginTop:22}}>Timeless interiors, custom furniture and thoughtful spaces designed around the way you live.</p></div>
      <div><div style={{fontSize:10,letterSpacing:".15em",textTransform:"uppercase",color:"#c39a54",marginBottom:18}}>Explore</div><div style={{display:"grid",gap:10,fontSize:13}}><Link style={{color:"inherit",textDecoration:"none"}} to="/about">About</Link><Link style={{color:"inherit",textDecoration:"none"}} to="/contact">Contact</Link><a style={{color:"inherit",textDecoration:"none"}} href="/#projects">Projects</a><a style={{color:"inherit",textDecoration:"none"}} href="/#shop">Shop</a></div></div>
      <div><div style={{fontSize:10,letterSpacing:".15em",textTransform:"uppercase",color:"#c39a54",marginBottom:18}}>Connect</div><a href="https://www.instagram.com/sensational_interiors07/" target="_blank" rel="noreferrer" style={{color:"inherit",textDecoration:"none",display:"inline-flex",alignItems:"center",gap:8}}>Instagram <FiArrowUpRight/></a></div>
    </div>
    <div style={{borderTop:"1px solid #393632",padding:"18px 20px",textAlign:"center",fontSize:10,color:"#8f8a82",letterSpacing:".08em"}}>© 2026 Sensational Interiors. All rights reserved.</div>
  </footer>
}
