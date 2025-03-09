// DOM要素の取得
const recipesTab = document.getElementById('recipes-tab');
const weeklyTab = document.getElementById('weekly-tab');
const favoritesTab = document.getElementById('favorites-tab');

const recipesSection = document.getElementById('recipes-section');
const weeklySection = document.getElementById('weekly-section');
const favoritesSection = document.getElementById('favorites-section');

const recipeList = document.getElementById('recipe-list');
const favoritesList = document.getElementById('favorites-list');
const weeklyMenu = document.getElementById('weekly-menu');

const categoryFilter = document.getElementById('category-filter');
const randomRecipeBtn = document.getElementById('random-recipe');
const generateMenuBtn = document.getElementById('generate-menu');
const shareMenuBtn = document.getElementById('share-menu');

// タブの切り替え
function switchTab(tab, section) {
    // すべてのタブから active クラスを削除
    recipesTab.classList.remove('active');
    weeklyTab.classList.remove('active');
    favoritesTab.classList.remove('active');
    
    // すべてのセクションから active-section クラスを削除
    recipesSection.classList.remove('active-section');
    weeklySection.classList.remove('active-section');
    favoritesSection.classList.remove('active-section');
    
    // クリックされたタブとそれに対応するセクションに active クラスを追加
    tab.classList.add('active');
    section.classList.add('active-section');
}

// レシピカードを作成する関数
function createRecipeCard(recipe, isFavorite = false) {
    const card = document.createElement('div');
    card.classList.add('recipe-card');
    
    // 仮の画像URL（実際の画像がない場合）
    const imageUrl = recipe.imageUrl || `https://placehold.co/400x300/E8F5E9/388E3C?text=${recipe.title}`;
    
    // お気に入りボタンのテキストと機能
    const favoriteText = isFavorite ? '★ お気に入りから削除' : '☆ お気に入りに追加';
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${recipe.title}" class="recipe-image">
        <div class="recipe-info">
            <h3 class="recipe-title">${recipe.title}</h3>
            <span class="recipe-category">${recipe.category}</span>
            <p class="recipe-time">調理時間: 約${recipe.cookingTime}分</p>
            <p>${recipe.description}</p>
            <div class="recipe-actions">
                <button class="favorite-btn" data-id="${recipe.id}">${favoriteText}</button>
            </div>
        </div>
    `;
    
    // お気に入りボタンのイベントリスナーを追加
    const favoriteBtn = card.querySelector('.favorite-btn');
    favoriteBtn.addEventListener('click', () => {
        if (isFavorite) {
            removeFromFavorites(recipe.id);
            renderFavorites(); // お気に入りリストを再レンダリング
        } else {
            addToFavorites(recipe);
            favoriteBtn.textContent = '★ お気に入りから削除';
        }
    });
    
    return card;
}

// レシピ一覧を表示する関数
function renderRecipes(filterCategory = 'all') {
    recipeList.innerHTML = ''; // リストをクリア
    
    // フィルタリングされたレシピを取得
    let filteredRecipes = recipes;
    if (filterCategory !== 'all') {
        filteredRecipes = recipes.filter(recipe => recipe.category === filterCategory);
    }
    
    // お気に入りリストを取得
    const favorites = getFavorites();
    const favoriteIds = favorites.map(fav => fav.id);
    
    // レシピカードを作成して追加
    filteredRecipes.forEach(recipe => {
        const isFavorite = favoriteIds.includes(recipe.id);
        const card = createRecipeCard(recipe, isFavorite);
        recipeList.appendChild(card);
    });
}

// お気に入りをローカルストレージから取得
function getFavorites() {
    const favoritesJson = localStorage.getItem('favorites');
    return favoritesJson ? JSON.parse(favoritesJson) : [];
}

// お気に入りに追加
function addToFavorites(recipe) {
    const favorites = getFavorites();
    
    // すでに存在しなければ追加
    if (!favorites.some(fav => fav.id === recipe.id)) {
        favorites.push(recipe);
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
}

// お気に入りから削除
function removeFromFavorites(recipeId) {
    let favorites = getFavorites();
    favorites = favorites.filter(recipe => recipe.id !== recipeId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// お気に入りリストを表示
function renderFavorites() {
    favoritesList.innerHTML = ''; // リストをクリア
    
    const favorites = getFavorites();
    
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p>お気に入りのレシピはまだありません。</p>';
        return;
    }
    
    // お気に入りのレシピカードを作成して追加
    favorites.forEach(recipe => {
        const card = createRecipeCard(recipe, true);
        favoritesList.appendChild(card);
    });
}

// ランダムなレシピを取得
function getRandomRecipe(category = 'all', excludeIds = []) {
    let filteredRecipes = recipes;
    
    if (category !== 'all') {
        filteredRecipes = recipes.filter(recipe => recipe.category === category);
    }
    
    if (excludeIds.length > 0) {
        filteredRecipes = filteredRecipes.filter(recipe => !excludeIds.includes(recipe.id));
    }
    
    if (filteredRecipes.length === 0) {
        return null;
    }
    
    const randomIndex = Math.floor(Math.random() * filteredRecipes.length);
    return filteredRecipes[randomIndex];
}

// 週間メニューを生成
function generateWeeklyMenu() {
    const days = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'];
    const menu = {};
    
    days.forEach(day => {
        // 各日に主菜1品、副菜1品、汁物1品を選択
        const mainDish = getRandomRecipe('主菜');
        const sideDish = getRandomRecipe('副菜');
        const soup = getRandomRecipe('汁物');
        
        menu[day] = {
            mainDish: mainDish,
            sideDish: sideDish,
            soup: soup
        };
    });
    
    // ローカルストレージに保存
    localStorage.setItem('weeklyMenu', JSON.stringify(menu));
    
    return menu;
}

// 週間メニューを表示
function renderWeeklyMenu() {
    weeklyMenu.innerHTML = '';
    
    let menu = JSON.parse(localStorage.getItem('weeklyMenu'));
    if (!menu) {
        menu = generateWeeklyMenu();
    }
    
    Object.keys(menu).forEach(day => {
        const dayMenu = menu[day];
        const dayElement = document.createElement('div');
        dayElement.classList.add('week-day');
        
        let dayContent = `<h3 class="day-title">${day}</h3>`;
        
        if (dayMenu.mainDish) {
            dayContent += `<div class="menu-item">
                <span class="menu-category">主菜:</span> ${dayMenu.mainDish.title}
            </div>`;
        }
        
        if (dayMenu.sideDish) {
            dayContent += `<div class="menu-item">
                <span class="menu-category">副菜:</span> ${dayMenu.sideDish.title}
            </div>`;
        }
        
        if (dayMenu.soup) {
            dayContent += `<div class="menu-item">
                <span class="menu-category">汁物:</span> ${dayMenu.soup.title}
            </div>`;
        }
        
        dayElement.innerHTML = dayContent;
        weeklyMenu.appendChild(dayElement);
    });
}

// メニューを共有（テキスト形式でクリップボードにコピー）
function shareWeeklyMenu() {
    const menu = JSON.parse(localStorage.getItem('weeklyMenu'));
    if (!menu) {
        alert('まだ週間メニューが生成されていません。');
        return;
    }
    
    let shareText = '【今週の献立】\n\n';
    
    Object.keys(menu).forEach(day => {
        const dayMenu = menu[day];
        shareText += `■ ${day}\n`;
        
        if (dayMenu.mainDish) {
            shareText += `主菜: ${dayMenu.mainDish.title}\n`;
        }
        
        if (dayMenu.sideDish) {
            shareText += `副菜: ${dayMenu.sideDish.title}\n`;
        }
        
        if (dayMenu.soup) {
            shareText += `汁物: ${dayMenu.soup.title}\n`;
        }
        
        shareText += '\n';
    });
    
    // クリップボードにコピー
    // navigator.clipboard APIはHTTPSでのみ動作するため、代替手段も用意
    try {
        navigator.clipboard.writeText(shareText)
            .then(() => alert('今週の献立をクリップボードにコピーしました！LINEなどに貼り付けてください。'));
    } catch (err) {
        // フォールバック: テキストエリアを使用してコピー
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('今週の献立をクリップボードにコピーしました！LINEなどに貼り付けてください。');
    }
}

// =============== イベントリスナーの設定 ===============

// タブ切り替え
recipesTab.addEventListener('click', () => switchTab(recipesTab, recipesSection));
weeklyTab.addEventListener('click', () => switchTab(weeklyTab, weeklySection));
favoritesTab.addEventListener('click', () => switchTab(favoritesTab, favoritesSection));

// カテゴリーフィルター
categoryFilter.addEventListener('change', () => {
    renderRecipes(categoryFilter.value);
});

// ランダムレシピ表示
randomRecipeBtn.addEventListener('click', () => {
    const randomRecipe = getRandomRecipe();
    if (randomRecipe) {
        alert(`おすすめレシピ: ${randomRecipe.title}`);
    }
});

// 週間メニュー生成
generateMenuBtn.addEventListener('click', () => {
    generateWeeklyMenu();
    renderWeeklyMenu();
});

// メニュー共有
shareMenuBtn.addEventListener('click', shareWeeklyMenu);

// ページ読み込み時の初期化
window.addEventListener('DOMContentLoaded', () => {
    renderRecipes();
    renderFavorites();
    renderWeeklyMenu();
});