from flask import Flask
from flask_cors import CORS
from extensions import db, login_manager
from models import User
from routes.auth_routes import auth_bp
from routes.room_routes import room_bp
from routes.game_routes import game_bp


app = Flask(__name__)

app.config["SECRET_KEY"] = "change-this-later"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///wavelength.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

CORS(app, supports_credentials=True)

db.init_app(app)
login_manager.init_app(app)


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


app.register_blueprint(auth_bp)
app.register_blueprint(room_bp)
app.register_blueprint(game_bp)


with app.app_context():
    db.create_all()


@app.route("/")
def home():
    return {"message": "Wavelength backend is running"}


if __name__ == "__main__":
    app.run(debug=True)