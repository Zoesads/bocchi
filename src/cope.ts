type Radius = {tl:number;tr:number;bl:number;br:number;}
enum ObjT {RTXT,RTG}
type COPEObject = {
  val: RectText | Rectangle,
  type: ObjT
};

class Font {
  public name: string;
  public size: number;
  constructor(font_name: string, font_size: number) {
    this.name = font_name;
    this.size = font_size;
  }
}

class Rectangle {
  public x: number;
  public y: number;
  public w: number;
  public h: number;
  public color: string;
  public radius: Radius;
  constructor(x_pos: number, y_pos: number, width: number, height: number, color: string, top_right_radius: number = 0, top_left_radius: number = 0, bottom_right_radius: number = 0, bottom_left_radius: number = 0) {
    this.x = x_pos;
    this.y = y_pos;
    this.w = width;
    this.h = height;
    this.color = color;
    this.radius = {
      tl: top_left_radius,
      tr: top_right_radius,
      bl: bottom_left_radius,
      br: bottom_right_radius
    }
  }
}

class RectText extends Rectangle {
  public font: Font;
  public fg_color: string;
  public text: string;
  constructor(x_pos: number, y_pos: number, width: number, height: number, color: string, foreground_color: string, font_name: string, font_size: number, text: string = "", top_right_radius: number = 0, top_left_radius: number = 0, bottom_right_radius: number = 0, bottom_left_radius: number = 0) {
    super(x_pos,y_pos,width,height,color,top_right_radius,top_left_radius,bottom_right_radius,bottom_left_radius);
    this.font = new Font(font_name, font_size);
    this.text = text;
    this.fg_color = foreground_color;
  }
}

class COPE {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private draw_list: Map<string, COPEObject>;
  private object_creation_counter: number;
  constructor(default_width: number = 512, default_height: number = 512) {
    this.object_creation_counter = 0;
    this.canvas = document.createElement("canvas");
    this.canvas.width = default_width;
    this.canvas.height = default_height;
    this.draw_list = new Map<string, COPEObject>();
    this.ctx = <CanvasRenderingContext2D> this.canvas.getContext("2d");
    console.log("initialized COPE 🚂🌫🌫");
  }
  private async __SHA256(inp: string): Promise<string> {
    const data: Uint8Array = new TextEncoder().encode(inp);
    const hash: ArrayBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashHex: string = Array.from(new Uint8Array(hash)).map((b)=>b.toString(16).padStart(2,"0")).join("");
    return hashHex;
  }
  public async DrawRectangle(rect: Rectangle): Promise<string> {
    let k: Promise<string> = this.__SHA256(this.object_creation_counter.toString());
    k.then((key: string)=>{
      this.draw_list.set(key, {
        val: rect,
        type: ObjT.RTG
      });
      ++this.object_creation_counter;
    });
    return k;
  }
  public async DrawRectText(rtext: RectText): Promise<string> {
    let k: Promise<string> = this.__SHA256(this.object_creation_counter.toString());
    k.then((key: string)=>{
      this.draw_list.set(key, {
        val: rtext,
        type: ObjT.RTXT
      });
      ++this.object_creation_counter;
    });
    return k;
  }
  public eraseObject(id: string): void {
    if (this.draw_list.has(id)) {
      this.draw_list.delete(id);
    }
  }
  public Update(): void {
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    this.draw_list.forEach((_v: COPEObject)=>{
      switch (_v.type) {
        case ObjT.RTG: {
          const o: Rectangle = <Rectangle> _v.val;
          this.ctx.fillStyle = o.color;
          this.ctx.beginPath();
          this.ctx.roundRect(o.x, o.y, o.w, o.h, [o.radius.tl, o.radius.tr, o.radius.bl, o.radius.br]);
          this.ctx.closePath();
          this.ctx.fill();
          // console.log("rect");
          break;
        }
        case ObjT.RTXT: {
          const o: RectText = <RectText> _v.val;
          this.ctx.fillStyle = o.color;
          this.ctx.beginPath();
          this.ctx.roundRect(o.x, o.y, o.w, o.h, [o.radius.tl, o.radius.tr, o.radius.bl, o.radius.br]);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.font = `${o.font.size}px ${o.font.name}`;
          this.ctx.fillStyle = o.fg_color;
          this.ctx.fillText(o.text, o.x+(o.w>>4), o.y+(o.h>>1));
          // console.log("rtxt");
          break;
        }
      }
    });
  }
}

export { COPE, Rectangle, RectText };

/*--------------------------------------------------------------------------------
  MIT License

  Copyright (c) 2023 Zoesads

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
--------------------------------------------------------------------------------*/