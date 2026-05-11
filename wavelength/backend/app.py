import os
from flask import Flask, jsonify
from flask_cors import CORS
from extensions import db, login_manager
from models import User
from routes.auth_routes import auth_bp
from routes.room_routes import room_bp
from routes.game_routes import game_bp
from routes.chat_routes import chat_bp
from routes.profile_routes import profile_bp
from routes.reaction_routes import reaction_bp


app = Flask(__name__)

app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "change-this-before-deploying")
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///wavelength.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# These settings make the session cookie work when the React app and Flask API are
# hosted on different origins (Render static site + Render web service, etc.).
# For localhost HTTP dev, keep the defaults so the cookie isn't marked Secure.
is_production = os.environ.get("FLASK_ENV") == "production" or os.environ.get("RENDER") == "true"
if is_production:
    app.config["SESSION_COOKIE_SAMESITE"] = "None"
    app.config["SESSION_COOKIE_SECURE"] = True

allowed_origin = os.environ.get("FRONTEND_ORIGIN", "http://localhost:3000")
CORS(app, supports_credentials=True, origins=[allowed_origin, "http://127.0.0.1:3000"])

db.init_app(app)
login_manager.init_app(app)
login_manager.login_view = "auth.login"


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({"error": "Not logged in"}), 401


app.register_blueprint(auth_bp)
app.register_blueprint(room_bp)
app.register_blueprint(game_bp)
app.register_blueprint(chat_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(reaction_bp)


with app.app_context():
    db.create_all()


@app.route("/")
def home():
    return {"message": "Wavelength backend is running"}


if __name__ == "__main__":
    app.run(debug=True)
