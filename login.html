<!DOCTYPE html>
<html lang="en-AU">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FALKA — Sign In</title>
    <meta name="robots" content="noindex,nofollow">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Archivo:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="falka.css">
    <link rel="icon" type="image/x-icon" href="favicon.ico">
    <style>
        body {
            background: var(--navy-deep);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem 1.5rem;
            position: relative;
            overflow: hidden;
        }
        body::before {
            content: '';
            position: absolute;
            inset: 0;
            background:
                radial-gradient(ellipse at top, rgba(184, 153, 104, 0.08), transparent 60%),
                radial-gradient(ellipse at bottom right, rgba(30, 47, 77, 0.5), transparent 70%);
            pointer-events: none;
        }
        .login-card {
            position: relative;
            width: 100%;
            max-width: 420px;
            padding: 3rem 2.5rem;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(245, 241, 234, 0.1);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
        }
        .login-logo {
            display: block;
            height: 44px;
            margin: 0 auto 2.5rem;
            filter: brightness(0) invert(1);
            opacity: 0.9;
        }
        .login-eyebrow {
            font-family: var(--font-mark);
            font-size: 0.7rem;
            letter-spacing: 0.35em;
            text-transform: uppercase;
            color: var(--accent-light);
            margin-bottom: 0.75rem;
            text-align: center;
            font-weight: 500;
        }
        .login-headline {
            font-family: var(--font-display);
            font-size: 1.5rem;
            font-weight: 700;
            text-transform: uppercase;
            color: #fff;
            text-align: center;
            margin-bottom: 2.5rem;
            letter-spacing: -0.005em;
        }
        .login-headline .accent {
            color: var(--accent);
            font-weight: 800;
        }
        .login-field {
            margin-bottom: 1.25rem;
        }
        .login-field label {
            display: block;
            font-family: var(--font-mark);
            font-size: 0.62rem;
            letter-spacing: 0.25em;
            text-transform: uppercase;
            color: rgba(245, 241, 234, 0.6);
            margin-bottom: 0.5rem;
            font-weight: 500;
        }
        .login-field input {
            width: 100%;
            padding: 0.95rem 1.1rem;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(245, 241, 234, 0.14);
            color: #fff;
            font-family: inherit;
            font-size: 0.95rem;
            transition: var(--transition-fast);
        }
        .login-field input:focus {
            outline: none;
            border-color: var(--accent);
            background: rgba(255, 255, 255, 0.07);
        }
        .login-error {
            min-height: 1.5em;
            margin: 0 0 1rem;
            font-size: 0.85rem;
            color: #ff9a82;
            text-align: center;
            letter-spacing: 0.02em;
        }
        .login-submit {
            width: 100%;
            padding: 1.1rem;
            background: var(--accent);
            color: var(--navy);
            font-family: var(--font-mark);
            font-size: 0.78rem;
            font-weight: 700;
            letter-spacing: 0.28em;
            text-transform: uppercase;
            border: none;
            cursor: pointer;
            transition: var(--transition);
        }
        .login-submit:hover { background: var(--accent-light); transform: translateY(-1px); }
        .login-submit:active { transform: translateY(0); }
        .login-footer {
            margin-top: 2rem;
            font-family: var(--font-mark);
            font-size: 0.62rem;
            letter-spacing: 0.3em;
            text-transform: uppercase;
            color: rgba(245, 241, 234, 0.4);
            text-align: center;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <div class="login-card">
        <img src="falka-images/logo.png" alt="FALKA Marine" class="login-logo">
        <p class="login-eyebrow">Private Preview</p>
        <h1 class="login-headline">SIGN <span class="accent">IN.</span></h1>
        <form id="loginForm" autocomplete="off" novalidate>
            <div class="login-field">
                <label for="user">Username</label>
                <input type="text" id="user" name="user" autofocus autocomplete="off" spellcheck="false">
            </div>
            <div class="login-field">
                <label for="pass">Password</label>
                <input type="password" id="pass" name="pass" autocomplete="off">
            </div>
            <p class="login-error" id="err" role="alert"></p>
            <button type="submit" class="login-submit">Enter</button>
        </form>
        <p class="login-footer">Falka Yachtworks Pty Ltd</p>
    </div>

    <script>
        // Credentials — deliberately easy per brief.
        const U = 'FALKA'
        const P = 'PK'

        const form = document.getElementById('loginForm')
        const err = document.getElementById('err')

        form.addEventListener('submit', (e) => {
            e.preventDefault()
            const user = document.getElementById('user').value.trim()
            const pass = document.getElementById('pass').value
            if (user === U && pass === P) {
                try { localStorage.setItem('falka-auth', '1') } catch (e) {}
                const dest = sessionStorage.getItem('falka-auth-dest') || '/'
                sessionStorage.removeItem('falka-auth-dest')
                location.replace(dest)
            } else {
                err.textContent = 'Incorrect username or password.'
                document.getElementById('pass').value = ''
                document.getElementById('pass').focus()
            }
        })
    </script>
</body>
</html>
