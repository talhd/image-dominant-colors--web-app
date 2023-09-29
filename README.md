<center>
<h1>TLDR:</h1>
<P><strong>I made a web app that can find the 3 dominant colors in an image using k-means algorithm.<br>
  To reach a good level of accuracy, the algorithm does not use RGB, it uses CIELAB color space.<br>
   I implemented k-means on the server side.<br><br>
frontend: html,css,vanilla js<br>
backend: node.js,express and more<br>
</strong>
</P>
  </center>
<img src="example.gif" alt="animated" /><br>

<strong>Get dominant colors of image:</strong>
<p>
To find the dominant colors of an image, we want a better method than just counting which color shows up the most.  why is counting colors naively not a good idea?
  
the problem is that in an image, you can have many different shades or versions of a single color. If we count them all separately, it would give us an inflated count.

For example:
<img src="1.png" alt="animated" /><br><br>
If we naively count the dominant colors here, we might say there are three dominant colors and they are all a shade of green. And based on the count, they have 16 pixels, 12 pixels, and 8 pixels each. But here's the catch: all those different greens make up only 60% of the image, while the remaining 40% is blue.<br>
When we count colors naively, we're actually ignoring 40% of the image, and that doesn't make much sense in representing the colors accurately.
</p>
