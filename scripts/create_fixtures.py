"""Original procedural demo compositions. No external/reference artwork used."""
from pathlib import Path
from PIL import Image, ImageDraw
import random
p=Path(__file__).resolve().parents[1]/'assets/artworks'
p.mkdir(exist_ok=True)
for i in range(1,7):
 im=Image.new('RGB',(960,1120),'#eee8de');d=ImageDraw.Draw(im)
 if i==1:
  d.rectangle((0,0,430,1120),fill='#ba5c43');d.rectangle((430,0,960,580),fill='#dbb895');d.rectangle((430,580,960,1120),fill='#2e4a61');d.ellipse((200,220,760,780),fill='#ebccb1');d.polygon([(430,580),(760,780),(430,780)],fill='#b75a43');d.rectangle((105,800,150,1030),fill='#171f2e')
 elif i==2:
  d.rectangle((0,0,960,1120),fill='#e9e2ed');d.arc((95,130,855,990),180,360,fill='#7c61a2',width=160);d.rectangle((95,550,255,970),fill='#7c61a2');d.ellipse((340,500,690,850),fill='#d77a46');d.ellipse((655,810,790,945),fill='#39385c')
 elif i==3:
  d.rectangle((0,0,960,1120),fill='#ded4c9');d.rectangle((150,310,355,980),fill='#3a284a');d.ellipse((150,200,355,420),fill='#3a284a');d.rectangle((390,200,605,980),fill='#9073a0');d.ellipse((390,90,605,310),fill='#9073a0');d.rectangle((640,530,820,980),fill='#bf8766');d.ellipse((640,430,820,640),fill='#bf8766');d.line((80,980,890,980),fill='#a79a91',width=6)
 elif i==4:
  d.rectangle((0,0,960,1120),fill='#d7c5ce');d.ellipse((650,160,800,310),fill='#efac7d');d.polygon([(0,650),(290,300),(670,760),(960,470),(960,1120),(0,1120)],fill='#9684a6');d.polygon([(0,850),(580,490),(960,960),(960,1120),(0,1120)],fill='#57688f');d.polygon([(0,1000),(340,750),(960,1050),(960,1120),(0,1120)],fill='#283e62')
 elif i==5:
  d.rectangle((0,0,960,1120),fill='#f0eade')
  palette=['#242c42','#be766f','#356388','#8f8ca5']
  for row in range(3):
   for col in range(2):
    x=100+col*390;y=80+row*330
    d.pieslice((x,y,x+300,y+300),0 if (row+col)%2 else 180,180 if (row+col)%2 else 360,fill=palette[(row+col)%4]);d.line((x,y+310,x+300,y+310),fill='#b4a393',width=4)
 elif i==6:
  d.rectangle((0,0,960,1120),fill='#e4d3bc');d.rounded_rectangle((130,160,660,970),radius=260,fill='#3d6490');d.rounded_rectangle((270,320,520,1000),radius=125,fill='#e4d3bc');d.ellipse((530,500,880,870),fill='#b76d55');d.rectangle((95,930,885,980),fill='#4c6058');d.ellipse((170,680,390,930),fill='#779180')
 # Subtle reproducible paper grain, generated independently of any supplied image.
 random.seed(i);pixels=im.load()
 for y in range(im.height):
  for x in range(im.width):
   n=random.randint(-5,5);pixels[x,y]=tuple(max(0,min(255,c+n)) for c in pixels[x,y])
 im.save(p/f'a{i}.png',optimize=True)
