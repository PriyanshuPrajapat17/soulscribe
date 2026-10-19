import sys
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix the CSS selectors
text = text.replace('.home-herovideo', '.home-hero video')
text = text.replace('home-her?', 'home-hero')

# Add the video element to the hero section
text = text.replace('<section class="home-hero" aria-label="Hero">', '<section class="home-hero" aria-label="Hero">\n<video src="assets/6964dd099bafe00337f35275bc54cc73.mp4" autoplay loop muted playsinline></video>')

# decrease space between video placer holder section and above text section
# In CSS, .home-typewriter-section padding is: padding: 3rem 1.5rem 1rem;
# Let's reduce padding bottom to 0
text = text.replace('padding: 3rem 1.5rem 1rem;', 'padding: 3rem 1.5rem 0rem;')

# Fix the YouTube scroll zoom: 
# "- zoom on scroll (video frame) till frame is in one desktop frame (not over zoomed) with white spacing on the side. give rounded edges to the video place holder frame"
# "- reduce to only 4 scroll to enlarge video frame"
# "- if user scrolls back up , dont reverse the zoom scroll effect, simply scroll a section above"
# This logic is mostly in main.js. But let's check index.html for youtube placeholder.
# "in home page youtube video should be play in website only not redirect to youtube . do it any how"
text = text.replace('<a href="https://youtu.be/some-video" target="_blank" class="yt-placeholder-content">', '<div class="yt-placeholder-content">')
text = text.replace('Watch on YouTube ?', '')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)
print('Hero video added, CSS fixed, space decreased, yt link updated')
