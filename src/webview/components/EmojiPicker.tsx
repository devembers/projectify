import { useState, useRef, useEffect } from 'react';

interface EmojiEntry {
  emoji: string;
  name: string;
}

const EMOJI_GROUPS: { label: string; emojis: EmojiEntry[] }[] = [
  {
    label: 'Smileys',
    emojis: [
      { emoji: '😀', name: 'grinning face' },
      { emoji: '😃', name: 'smiley' },
      { emoji: '😄', name: 'smile' },
      { emoji: '😁', name: 'grin' },
      { emoji: '😆', name: 'laughing' },
      { emoji: '😅', name: 'sweat smile' },
      { emoji: '🤣', name: 'rofl' },
      { emoji: '😂', name: 'joy' },
      { emoji: '🙂', name: 'slightly smiling' },
      { emoji: '😉', name: 'wink' },
      { emoji: '😊', name: 'blush' },
      { emoji: '😇', name: 'innocent halo' },
      { emoji: '🥰', name: 'smiling hearts love' },
      { emoji: '😍', name: 'heart eyes' },
      { emoji: '🤩', name: 'star struck' },
      { emoji: '😎', name: 'sunglasses cool' },
      { emoji: '🤓', name: 'nerd' },
      { emoji: '🧐', name: 'monocle' },
      { emoji: '🤔', name: 'thinking' },
      { emoji: '😏', name: 'smirk' },
      { emoji: '🫡', name: 'salute' },
      { emoji: '🤗', name: 'hug' },
      { emoji: '🫠', name: 'melting' },
      { emoji: '😶', name: 'no mouth silent' },
      { emoji: '🙄', name: 'eye roll' },
      { emoji: '😬', name: 'grimace' },
      { emoji: '🤥', name: 'lying pinocchio' },
      { emoji: '😌', name: 'relieved' },
      { emoji: '😴', name: 'sleeping zzz' },
      { emoji: '🥳', name: 'party face celebration' },
    ],
  },
  {
    label: 'Hands & People',
    emojis: [
      { emoji: '👋', name: 'wave hello' },
      { emoji: '👍', name: 'thumbs up' },
      { emoji: '👎', name: 'thumbs down' },
      { emoji: '👏', name: 'clap' },
      { emoji: '🙌', name: 'raised hands hooray' },
      { emoji: '🤝', name: 'handshake' },
      { emoji: '✌️', name: 'peace victory' },
      { emoji: '🤞', name: 'crossed fingers luck' },
      { emoji: '🫶', name: 'heart hands' },
      { emoji: '💪', name: 'muscle strong' },
      { emoji: '🧑‍💻', name: 'technologist coder developer' },
      { emoji: '👨‍💻', name: 'man technologist coder' },
      { emoji: '👩‍💻', name: 'woman technologist coder' },
      { emoji: '🧑‍🔬', name: 'scientist' },
      { emoji: '🧑‍🎨', name: 'artist' },
      { emoji: '🧑‍🚀', name: 'astronaut' },
      { emoji: '🥷', name: 'ninja' },
      { emoji: '🦸', name: 'superhero' },
      { emoji: '🧙', name: 'wizard mage' },
      { emoji: '👻', name: 'ghost' },
    ],
  },
  {
    label: 'Animals & Nature',
    emojis: [
      { emoji: '🐶', name: 'dog puppy' },
      { emoji: '🐱', name: 'cat kitten' },
      { emoji: '🐭', name: 'mouse' },
      { emoji: '🐹', name: 'hamster' },
      { emoji: '🐰', name: 'rabbit bunny' },
      { emoji: '🦊', name: 'fox' },
      { emoji: '🐻', name: 'bear' },
      { emoji: '🐼', name: 'panda' },
      { emoji: '🐸', name: 'frog' },
      { emoji: '🐵', name: 'monkey' },
      { emoji: '🐔', name: 'chicken' },
      { emoji: '🐧', name: 'penguin' },
      { emoji: '🐦', name: 'bird' },
      { emoji: '🦅', name: 'eagle' },
      { emoji: '🦉', name: 'owl' },
      { emoji: '🐝', name: 'bee honeybee' },
      { emoji: '🐛', name: 'bug caterpillar' },
      { emoji: '🦋', name: 'butterfly' },
      { emoji: '🐌', name: 'snail' },
      { emoji: '🐙', name: 'octopus' },
      { emoji: '🌲', name: 'evergreen tree pine' },
      { emoji: '🌴', name: 'palm tree tropical' },
      { emoji: '🌵', name: 'cactus desert' },
      { emoji: '🍀', name: 'four leaf clover luck' },
      { emoji: '🌸', name: 'cherry blossom flower' },
      { emoji: '🌻', name: 'sunflower' },
      { emoji: '🌈', name: 'rainbow' },
      { emoji: '⭐', name: 'star' },
      { emoji: '🌙', name: 'crescent moon' },
      { emoji: '☀️', name: 'sun' },
    ],
  },
  {
    label: 'Food & Drink',
    emojis: [
      { emoji: '🍎', name: 'apple red' },
      { emoji: '🍊', name: 'orange tangerine' },
      { emoji: '🍋', name: 'lemon' },
      { emoji: '🍇', name: 'grapes' },
      { emoji: '🍓', name: 'strawberry' },
      { emoji: '🫐', name: 'blueberries' },
      { emoji: '🍑', name: 'peach' },
      { emoji: '🥑', name: 'avocado' },
      { emoji: '🌶️', name: 'hot pepper chili' },
      { emoji: '🍕', name: 'pizza' },
      { emoji: '🍔', name: 'hamburger burger' },
      { emoji: '🌮', name: 'taco' },
      { emoji: '🍜', name: 'noodles ramen' },
      { emoji: '🍣', name: 'sushi' },
      { emoji: '🧁', name: 'cupcake' },
      { emoji: '🍰', name: 'cake' },
      { emoji: '🍩', name: 'donut doughnut' },
      { emoji: '☕', name: 'coffee' },
      { emoji: '🍵', name: 'tea' },
      { emoji: '🧋', name: 'bubble tea boba' },
    ],
  },
  {
    label: 'Objects & Tools',
    emojis: [
      { emoji: '💻', name: 'laptop computer' },
      { emoji: '🖥️', name: 'desktop computer monitor' },
      { emoji: '⌨️', name: 'keyboard' },
      { emoji: '🖱️', name: 'mouse computer' },
      { emoji: '💾', name: 'floppy disk save' },
      { emoji: '📱', name: 'phone mobile' },
      { emoji: '📟', name: 'pager' },
      { emoji: '🔧', name: 'wrench tool' },
      { emoji: '🔨', name: 'hammer' },
      { emoji: '⚙️', name: 'gear settings' },
      { emoji: '🔬', name: 'microscope' },
      { emoji: '🔭', name: 'telescope' },
      { emoji: '💡', name: 'light bulb idea' },
      { emoji: '🔑', name: 'key' },
      { emoji: '🔒', name: 'lock' },
      { emoji: '📦', name: 'package box' },
      { emoji: '📁', name: 'folder' },
      { emoji: '📂', name: 'open folder' },
      { emoji: '📝', name: 'memo note' },
      { emoji: '📌', name: 'pin pushpin' },
      { emoji: '📎', name: 'paperclip' },
      { emoji: '✏️', name: 'pencil edit' },
      { emoji: '🖊️', name: 'pen' },
      { emoji: '📐', name: 'triangular ruler' },
      { emoji: '📏', name: 'ruler' },
      { emoji: '🗂️', name: 'card index dividers' },
      { emoji: '📋', name: 'clipboard' },
      { emoji: '📊', name: 'bar chart' },
      { emoji: '📈', name: 'chart increasing trending up' },
      { emoji: '📉', name: 'chart decreasing trending down' },
    ],
  },
  {
    label: 'Symbols & Travel',
    emojis: [
      { emoji: '🚀', name: 'rocket launch' },
      { emoji: '✈️', name: 'airplane plane' },
      { emoji: '🚗', name: 'car automobile' },
      { emoji: '🚢', name: 'ship boat' },
      { emoji: '🏠', name: 'house home' },
      { emoji: '🏢', name: 'office building' },
      { emoji: '🏗️', name: 'construction building' },
      { emoji: '⚡', name: 'lightning zap electric' },
      { emoji: '🔥', name: 'fire flame hot' },
      { emoji: '💧', name: 'water droplet' },
      { emoji: '🎯', name: 'target bullseye dart' },
      { emoji: '🏆', name: 'trophy award' },
      { emoji: '🎮', name: 'game controller' },
      { emoji: '🎲', name: 'dice game' },
      { emoji: '🎨', name: 'art palette paint' },
      { emoji: '🎵', name: 'music note' },
      { emoji: '🎬', name: 'clapper movie film' },
      { emoji: '💎', name: 'gem diamond' },
      { emoji: '🧲', name: 'magnet' },
      { emoji: '🧪', name: 'test tube experiment' },
      { emoji: '❤️', name: 'red heart love' },
      { emoji: '🧡', name: 'orange heart' },
      { emoji: '💛', name: 'yellow heart' },
      { emoji: '💚', name: 'green heart' },
      { emoji: '💙', name: 'blue heart' },
      { emoji: '💜', name: 'purple heart' },
      { emoji: '🖤', name: 'black heart' },
      { emoji: '🤍', name: 'white heart' },
      { emoji: '✅', name: 'check mark done' },
      { emoji: '❌', name: 'cross mark x' },
      { emoji: '⚠️', name: 'warning' },
      { emoji: '🚩', name: 'red flag' },
      { emoji: '🏁', name: 'checkered flag finish' },
      { emoji: '♻️', name: 'recycle' },
      { emoji: '🔴', name: 'red circle' },
      { emoji: '🟠', name: 'orange circle' },
      { emoji: '🟡', name: 'yellow circle' },
      { emoji: '🟢', name: 'green circle' },
      { emoji: '🔵', name: 'blue circle' },
      { emoji: '🟣', name: 'purple circle' },
    ],
  },
  {
    label: 'Flags',
    emojis: [
      { emoji: '🇦🇩', name: 'andorra' },
      { emoji: '🇦🇪', name: 'united arab emirates uae' },
      { emoji: '🇦🇫', name: 'afghanistan' },
      { emoji: '🇦🇬', name: 'antigua barbuda' },
      { emoji: '🇦🇮', name: 'anguilla' },
      { emoji: '🇦🇱', name: 'albania' },
      { emoji: '🇦🇲', name: 'armenia' },
      { emoji: '🇦🇴', name: 'angola' },
      { emoji: '🇦🇷', name: 'argentina' },
      { emoji: '🇦🇸', name: 'american samoa' },
      { emoji: '🇦🇹', name: 'austria' },
      { emoji: '🇦🇺', name: 'australia' },
      { emoji: '🇦🇼', name: 'aruba' },
      { emoji: '🇦🇿', name: 'azerbaijan' },
      { emoji: '🇧🇦', name: 'bosnia herzegovina' },
      { emoji: '🇧🇧', name: 'barbados' },
      { emoji: '🇧🇩', name: 'bangladesh' },
      { emoji: '🇧🇪', name: 'belgium' },
      { emoji: '🇧🇫', name: 'burkina faso' },
      { emoji: '🇧🇬', name: 'bulgaria' },
      { emoji: '🇧🇭', name: 'bahrain' },
      { emoji: '🇧🇮', name: 'burundi' },
      { emoji: '🇧🇯', name: 'benin' },
      { emoji: '🇧🇲', name: 'bermuda' },
      { emoji: '🇧🇳', name: 'brunei' },
      { emoji: '🇧🇴', name: 'bolivia' },
      { emoji: '🇧🇷', name: 'brazil' },
      { emoji: '🇧🇸', name: 'bahamas' },
      { emoji: '🇧🇹', name: 'bhutan' },
      { emoji: '🇧🇼', name: 'botswana' },
      { emoji: '🇧🇾', name: 'belarus' },
      { emoji: '🇧🇿', name: 'belize' },
      { emoji: '🇨🇦', name: 'canada' },
      { emoji: '🇨🇩', name: 'congo kinshasa drc' },
      { emoji: '🇨🇫', name: 'central african republic' },
      { emoji: '🇨🇬', name: 'congo brazzaville' },
      { emoji: '🇨🇭', name: 'switzerland' },
      { emoji: '🇨🇮', name: 'cote divoire ivory coast' },
      { emoji: '🇨🇰', name: 'cook islands' },
      { emoji: '🇨🇱', name: 'chile' },
      { emoji: '🇨🇲', name: 'cameroon' },
      { emoji: '🇨🇳', name: 'china' },
      { emoji: '🇨🇴', name: 'colombia' },
      { emoji: '🇨🇷', name: 'costa rica' },
      { emoji: '🇨🇺', name: 'cuba' },
      { emoji: '🇨🇻', name: 'cape verde' },
      { emoji: '🇨🇼', name: 'curacao' },
      { emoji: '🇨🇾', name: 'cyprus' },
      { emoji: '🇨🇿', name: 'czech republic czechia' },
      { emoji: '🇩🇪', name: 'germany' },
      { emoji: '🇩🇯', name: 'djibouti' },
      { emoji: '🇩🇰', name: 'denmark' },
      { emoji: '🇩🇲', name: 'dominica' },
      { emoji: '🇩🇴', name: 'dominican republic' },
      { emoji: '🇩🇿', name: 'algeria' },
      { emoji: '🇪🇨', name: 'ecuador' },
      { emoji: '🇪🇪', name: 'estonia' },
      { emoji: '🇪🇬', name: 'egypt' },
      { emoji: '🇪🇷', name: 'eritrea' },
      { emoji: '🇪🇸', name: 'spain' },
      { emoji: '🇪🇹', name: 'ethiopia' },
      { emoji: '🇪🇺', name: 'european union eu' },
      { emoji: '🇫🇮', name: 'finland' },
      { emoji: '🇫🇯', name: 'fiji' },
      { emoji: '🇫🇲', name: 'micronesia' },
      { emoji: '🇫🇴', name: 'faroe islands' },
      { emoji: '🇫🇷', name: 'france' },
      { emoji: '🇬🇦', name: 'gabon' },
      { emoji: '🇬🇧', name: 'united kingdom uk britain' },
      { emoji: '🇬🇩', name: 'grenada' },
      { emoji: '🇬🇪', name: 'georgia' },
      { emoji: '🇬🇭', name: 'ghana' },
      { emoji: '🇬🇮', name: 'gibraltar' },
      { emoji: '🇬🇱', name: 'greenland' },
      { emoji: '🇬🇲', name: 'gambia' },
      { emoji: '🇬🇳', name: 'guinea' },
      { emoji: '🇬🇵', name: 'guadeloupe' },
      { emoji: '🇬🇶', name: 'equatorial guinea' },
      { emoji: '🇬🇷', name: 'greece' },
      { emoji: '🇬🇹', name: 'guatemala' },
      { emoji: '🇬🇺', name: 'guam' },
      { emoji: '🇬🇼', name: 'guinea bissau' },
      { emoji: '🇬🇾', name: 'guyana' },
      { emoji: '🇭🇰', name: 'hong kong' },
      { emoji: '🇭🇳', name: 'honduras' },
      { emoji: '🇭🇷', name: 'croatia' },
      { emoji: '🇭🇹', name: 'haiti' },
      { emoji: '🇭🇺', name: 'hungary' },
      { emoji: '🇮🇨', name: 'canary islands' },
      { emoji: '🇮🇩', name: 'indonesia' },
      { emoji: '🇮🇪', name: 'ireland' },
      { emoji: '🇮🇱', name: 'israel' },
      { emoji: '🇮🇳', name: 'india' },
      { emoji: '🇮🇶', name: 'iraq' },
      { emoji: '🇮🇷', name: 'iran' },
      { emoji: '🇮🇸', name: 'iceland' },
      { emoji: '🇮🇹', name: 'italy' },
      { emoji: '🇯🇪', name: 'jersey' },
      { emoji: '🇯🇲', name: 'jamaica' },
      { emoji: '🇯🇴', name: 'jordan' },
      { emoji: '🇯🇵', name: 'japan' },
      { emoji: '🇰🇪', name: 'kenya' },
      { emoji: '🇰🇬', name: 'kyrgyzstan' },
      { emoji: '🇰🇭', name: 'cambodia' },
      { emoji: '🇰🇮', name: 'kiribati' },
      { emoji: '🇰🇲', name: 'comoros' },
      { emoji: '🇰🇳', name: 'saint kitts nevis' },
      { emoji: '🇰🇵', name: 'north korea' },
      { emoji: '🇰🇷', name: 'south korea' },
      { emoji: '🇰🇼', name: 'kuwait' },
      { emoji: '🇰🇾', name: 'cayman islands' },
      { emoji: '🇰🇿', name: 'kazakhstan' },
      { emoji: '🇱🇦', name: 'laos' },
      { emoji: '🇱🇧', name: 'lebanon' },
      { emoji: '🇱🇨', name: 'saint lucia' },
      { emoji: '🇱🇮', name: 'liechtenstein' },
      { emoji: '🇱🇰', name: 'sri lanka' },
      { emoji: '🇱🇷', name: 'liberia' },
      { emoji: '🇱🇸', name: 'lesotho' },
      { emoji: '🇱🇹', name: 'lithuania' },
      { emoji: '🇱🇺', name: 'luxembourg' },
      { emoji: '🇱🇻', name: 'latvia' },
      { emoji: '🇱🇾', name: 'libya' },
      { emoji: '🇲🇦', name: 'morocco' },
      { emoji: '🇲🇨', name: 'monaco' },
      { emoji: '🇲🇩', name: 'moldova' },
      { emoji: '🇲🇪', name: 'montenegro' },
      { emoji: '🇲🇬', name: 'madagascar' },
      { emoji: '🇲🇭', name: 'marshall islands' },
      { emoji: '🇲🇰', name: 'north macedonia' },
      { emoji: '🇲🇱', name: 'mali' },
      { emoji: '🇲🇲', name: 'myanmar burma' },
      { emoji: '🇲🇳', name: 'mongolia' },
      { emoji: '🇲🇴', name: 'macao macau' },
      { emoji: '🇲🇶', name: 'martinique' },
      { emoji: '🇲🇷', name: 'mauritania' },
      { emoji: '🇲🇸', name: 'montserrat' },
      { emoji: '🇲🇹', name: 'malta' },
      { emoji: '🇲🇺', name: 'mauritius' },
      { emoji: '🇲🇻', name: 'maldives' },
      { emoji: '🇲🇼', name: 'malawi' },
      { emoji: '🇲🇽', name: 'mexico' },
      { emoji: '🇲🇾', name: 'malaysia' },
      { emoji: '🇲🇿', name: 'mozambique' },
      { emoji: '🇳🇦', name: 'namibia' },
      { emoji: '🇳🇪', name: 'niger' },
      { emoji: '🇳🇬', name: 'nigeria' },
      { emoji: '🇳🇮', name: 'nicaragua' },
      { emoji: '🇳🇱', name: 'netherlands holland' },
      { emoji: '🇳🇴', name: 'norway' },
      { emoji: '🇳🇵', name: 'nepal' },
      { emoji: '🇳🇷', name: 'nauru' },
      { emoji: '🇳🇺', name: 'niue' },
      { emoji: '🇳🇿', name: 'new zealand' },
      { emoji: '🇴🇲', name: 'oman' },
      { emoji: '🇵🇦', name: 'panama' },
      { emoji: '🇵🇪', name: 'peru' },
      { emoji: '🇵🇫', name: 'french polynesia' },
      { emoji: '🇵🇬', name: 'papua new guinea' },
      { emoji: '🇵🇭', name: 'philippines' },
      { emoji: '🇵🇰', name: 'pakistan' },
      { emoji: '🇵🇱', name: 'poland' },
      { emoji: '🇵🇷', name: 'puerto rico' },
      { emoji: '🇵🇸', name: 'palestine' },
      { emoji: '🇵🇹', name: 'portugal' },
      { emoji: '🇵🇼', name: 'palau' },
      { emoji: '🇵🇾', name: 'paraguay' },
      { emoji: '🇶🇦', name: 'qatar' },
      { emoji: '🇷🇪', name: 'reunion' },
      { emoji: '🇷🇴', name: 'romania' },
      { emoji: '🇷🇸', name: 'serbia' },
      { emoji: '🇷🇺', name: 'russia' },
      { emoji: '🇷🇼', name: 'rwanda' },
      { emoji: '🇸🇦', name: 'saudi arabia' },
      { emoji: '🇸🇧', name: 'solomon islands' },
      { emoji: '🇸🇨', name: 'seychelles' },
      { emoji: '🇸🇩', name: 'sudan' },
      { emoji: '🇸🇪', name: 'sweden' },
      { emoji: '🇸🇬', name: 'singapore' },
      { emoji: '🇸🇮', name: 'slovenia' },
      { emoji: '🇸🇰', name: 'slovakia' },
      { emoji: '🇸🇱', name: 'sierra leone' },
      { emoji: '🇸🇲', name: 'san marino' },
      { emoji: '🇸🇳', name: 'senegal' },
      { emoji: '🇸🇴', name: 'somalia' },
      { emoji: '🇸🇷', name: 'suriname' },
      { emoji: '🇸🇸', name: 'south sudan' },
      { emoji: '🇸🇹', name: 'sao tome principe' },
      { emoji: '🇸🇻', name: 'el salvador' },
      { emoji: '🇸🇽', name: 'sint maarten' },
      { emoji: '🇸🇾', name: 'syria' },
      { emoji: '🇸🇿', name: 'eswatini swaziland' },
      { emoji: '🇹🇨', name: 'turks caicos islands' },
      { emoji: '🇹🇩', name: 'chad' },
      { emoji: '🇹🇬', name: 'togo' },
      { emoji: '🇹🇭', name: 'thailand' },
      { emoji: '🇹🇯', name: 'tajikistan' },
      { emoji: '🇹🇰', name: 'tokelau' },
      { emoji: '🇹🇱', name: 'timor leste east timor' },
      { emoji: '🇹🇲', name: 'turkmenistan' },
      { emoji: '🇹🇳', name: 'tunisia' },
      { emoji: '🇹🇴', name: 'tonga' },
      { emoji: '🇹🇷', name: 'turkey turkiye' },
      { emoji: '🇹🇹', name: 'trinidad tobago' },
      { emoji: '🇹🇻', name: 'tuvalu' },
      { emoji: '🇹🇼', name: 'taiwan' },
      { emoji: '🇹🇿', name: 'tanzania' },
      { emoji: '🇺🇦', name: 'ukraine' },
      { emoji: '🇺🇬', name: 'uganda' },
      { emoji: '🇺🇳', name: 'united nations' },
      { emoji: '🇺🇸', name: 'united states usa america' },
      { emoji: '🇺🇾', name: 'uruguay' },
      { emoji: '🇺🇿', name: 'uzbekistan' },
      { emoji: '🇻🇦', name: 'vatican city' },
      { emoji: '🇻🇨', name: 'saint vincent grenadines' },
      { emoji: '🇻🇪', name: 'venezuela' },
      { emoji: '🇻🇬', name: 'british virgin islands' },
      { emoji: '🇻🇮', name: 'us virgin islands' },
      { emoji: '🇻🇳', name: 'vietnam' },
      { emoji: '🇻🇺', name: 'vanuatu' },
      { emoji: '🇼🇫', name: 'wallis futuna' },
      { emoji: '🇼🇸', name: 'samoa' },
      { emoji: '🇽🇰', name: 'kosovo' },
      { emoji: '🇾🇪', name: 'yemen' },
      { emoji: '🇾🇹', name: 'mayotte' },
      { emoji: '🇿🇦', name: 'south africa' },
      { emoji: '🇿🇲', name: 'zambia' },
      { emoji: '🇿🇼', name: 'zimbabwe' },
      { emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'england' },
      { emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', name: 'scotland' },
      { emoji: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', name: 'wales' },
      { emoji: '🏴‍☠️', name: 'pirate flag' },
    ],
  },
];

const ALL_EMOJIS = EMOJI_GROUPS.flatMap((g) => g.emojis);

interface EmojiPickerProps {
  currentEmoji: string | null;
  onSelect: (emoji: string | null) => void;
  onClose: () => void;
}

export function EmojiPicker({ currentEmoji, onSelect, onClose }: EmojiPickerProps) {
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const query = search.toLowerCase().trim();
  const filtered = query
    ? ALL_EMOJIS.filter((e) => e.name.includes(query) || e.emoji.includes(search))
    : null;

  return (
    <div className="icon-picker" ref={ref} onClick={(e) => e.stopPropagation()}>
      <input
        ref={inputRef}
        className="icon-picker__search"
        type="text"
        placeholder="Search emojis..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {currentEmoji && (
        <button
          className="icon-picker__reset"
          onClick={() => onSelect(null)}
        >
          <span className="codicon codicon-discard" /> Clear emoji
        </button>
      )}
      <div className="emoji-picker__scroll">
        {filtered ? (
          <div className="icon-picker__grid icon-picker__grid--emoji">
            {filtered.map((entry, i) => (
              <button
                key={i}
                className={`icon-picker__item icon-picker__item--emoji ${currentEmoji === entry.emoji ? 'icon-picker__item--selected' : ''}`}
                onClick={() => onSelect(entry.emoji)}
                title={entry.name}
              >
                {entry.emoji}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="icon-picker__empty">No matching emoji</div>
            )}
          </div>
        ) : (
          EMOJI_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="emoji-picker__group-label">{group.label}</div>
              <div className="icon-picker__grid icon-picker__grid--emoji">
                {group.emojis.map((entry, i) => (
                  <button
                    key={i}
                    className={`icon-picker__item icon-picker__item--emoji ${currentEmoji === entry.emoji ? 'icon-picker__item--selected' : ''}`}
                    onClick={() => onSelect(entry.emoji)}
                    title={entry.name}
                  >
                    {entry.emoji}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
