import { COPE, RectText, Rectangle } from "./cope";
const mount_location: HTMLElement | null = document.getElementById("to_mount");
if (mount_location == null) {
  throw Error("unable to mount engine");
}
const engine: COPE = new COPE(window.innerWidth, window.innerHeight);
mount_location.appendChild(engine.canvas);
const win_width: number = window.innerWidth, win_height: number = window.innerHeight;
// Background color: #5d768c
const background: Rectangle = new Rectangle(0, 0, win_width, win_height, "#5d768c");
// Background color: #9cca7b
const topbar: Rectangle = new Rectangle(0, 0, win_width, 50, "#9cca7b", 0, 0, 8, 8);
// Foreground color: #ffed43
const current_date_display: RectText = new RectText(25, 35, 0, 0, "#000000", "#ffed43", "Nunito", 25,  "Hi Bocchi, today is " + (new Date().toLocaleDateString("en-US", {weekday: "long", day: "numeric", month: "long", year: "numeric"})));
// Foreground color: #ffed43
const about_btt: RectText = new RectText(win_width-100,32,0,0, "#000000", "#ffed43", "Nunito", 22, "About");
// Foreground color: #ffed43
const new_task_btt: RectText = new RectText(win_width-220,32,0,0, "#000000", "#ffed43", "Nunito", 22, "New task");
// * Going on tasks section *
// Background color: #e0a3b3
const going_on_section_bg: Rectangle = new Rectangle(5,60,258+(win_width>>1),win_height, "#e0a3b3", 5, 5, 5, 5);
// Background color: #e4adbb
const going_on_section_header_bg: Rectangle = new Rectangle(5,60,258+(win_width>>1),55, "#e4adbb", 5, 5, 0, 0);
// Foreground color: #3898ec
const going_on_section_text: RectText = new RectText(350,95,0,0,"#000000", "#3898ec", "Nunito", 25, "Ongoing task");
// * Pending section *
// Background color: #e0a3b3
const pending_section_bg: Rectangle = new Rectangle(win_width-((win_width>>1)-272),60,(win_width>>1)-275,win_height, "#e0a3b3", 5, 5, 5, 5);
// Background color: #e4adbb
const pending_section_header_bg: Rectangle = new Rectangle(win_width-((win_width>>1)-272),60,(win_width>>1)-275,55, "#e4adbb", 5, 5, 0, 0);
// Foreground color: #3898ec
const pending_section_text: RectText = new RectText(win_width-((win_width>>2)-95),95,0,0,"#000000", "#3898ec", "Nunito", 25, "Pending");
// draw main components
await engine.DrawRectangle(background);
await engine.DrawRectangle(topbar);
await engine.DrawRectText(current_date_display);
await engine.DrawRectText(about_btt);
await engine.DrawRectText(new_task_btt);
await engine.DrawRectangle(going_on_section_bg);
await engine.DrawRectangle(going_on_section_header_bg);
await engine.DrawRectText(going_on_section_text);
await engine.DrawRectangle(pending_section_bg);
await engine.DrawRectangle(pending_section_header_bg);
await engine.DrawRectText(pending_section_text);
let pending_tasks: {[index: string]: {background: Rectangle, text: RectText, _bg_id: string, _txt_id: string}} = {}, ongoing_tasks: {[index: string]: {background: Rectangle, text: RectText, _bg_id: string, _txt_id: string}} = {};
let isLeftClicked: boolean = false;
let mouse_x: number = 0, mouse_y: number = 0;
window.onmousedown = ((e: MouseEvent)=> {
  if (e.button == 0) {
    isLeftClicked = true;
    mouse_x = e.clientX;
    mouse_y = e.clientY;
  }
});
let abouted: boolean = false;
let newtasked: boolean = false;
let ongoing_task_clicked: boolean = false;
let pending_task_clicked: boolean = false;
window.onmouseup = ((e: MouseEvent)=> {
  if (e.button == 0) {
    isLeftClicked = false;
    abouted = false;
    newtasked = false;
    ongoing_task_clicked = false;
    pending_task_clicked = false;
  }
})
async function update() {
  let ptask_r_ofs: number = 0;
  for (let task_name in pending_tasks) {
    const task = pending_tasks[task_name];
    if (!pending_task_clicked && isLeftClicked && mouse_x >= task.background.x && mouse_x <= task.background.x + task.background.w && mouse_y >= task.background.y && mouse_y <= task.background.y + task.background.h) {
      engine.eraseObject(task._bg_id);
      engine.eraseObject(task._txt_id);
      delete pending_tasks[task_name];
      let rec: Rectangle = new Rectangle(-9999,-9999,248+(win_width>>1),50,"#ff958f", 5, 5, 5, 5);
      let txt: RectText = new RectText(-9999,-9999,0,0,"#000000","#000000","Nunito", 20, task.text.text);
      let id1: string = await engine.DrawRectangle(rec);
      let id2: string = await engine.DrawRectText(txt);
      ongoing_tasks[id1] = {background: rec,text: txt, _bg_id: id1,_txt_id: id2};
      pending_task_clicked = true;
      continue;
    }
    task.background.x = win_width-((win_width>>1)-272)+5;
    task.background.y = ptask_r_ofs+120;
    task.text.x = win_width-((win_width>>1)-272)+10;
    task.text.y = ptask_r_ofs+150;
    ptask_r_ofs += 55;
  }
  let ongointask_r_ofs: number = 0;
  for (let task_name in ongoing_tasks) {
    const task = ongoing_tasks[task_name];
    if (!ongoing_task_clicked && isLeftClicked && mouse_x >= task.background.x && mouse_x <= task.background.x + task.background.w && mouse_y >= task.background.y && mouse_y <= task.background.y + task.background.h) {
      engine.eraseObject(task._bg_id);
      engine.eraseObject(task._txt_id);
      delete ongoing_tasks[task_name];
      ongoing_task_clicked = true;
      continue;
    }
    task.background.x = 10;
    task.background.y = ongointask_r_ofs+120;
    task.text.x = 15;
    task.text.y = ongointask_r_ofs+150;
    ongointask_r_ofs += 55;
  }
  engine.Update();
  if (isLeftClicked) {
    // console.log("clicked");
    if (!abouted && mouse_x >= about_btt.x && mouse_x <= about_btt.x+50 && mouse_y >= about_btt.y-20 && mouse_y <= about_btt.y+10) {
      alert("From team 1 with love 💖");
      abouted = true;
    }
    if (!newtasked && mouse_x >= new_task_btt.x && mouse_x <= new_task_btt.x+100 && mouse_y >= new_task_btt.y-20 && mouse_y <= new_task_btt.y+10) {
      let user_task: string = String(prompt("Enter your new task"));
      let rec: Rectangle = new Rectangle(-9999,-9999,(win_width>>1)-285,50,"#947e7c", 5, 5, 5, 5);
      let txt: RectText = new RectText(-9999,-9999,0,0,"#000000","#000000","Nunito", 20, user_task);
      let id1: string = await engine.DrawRectangle(rec);
      let id2: string = await engine.DrawRectText(txt);
      pending_tasks[id1] = {background: rec,text: txt, _bg_id: id1,_txt_id: id2};
      newtasked = true;
    }
  }
  window.requestAnimationFrame(update);
}
await update();