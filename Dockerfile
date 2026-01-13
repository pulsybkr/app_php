FROM php:8.2-apache

# Installation des extensions PHP nécessaires
RUN docker-php-ext-install pdo pdo_mysql mysqli

# Activation du module Apache rewrite
RUN a2enmod rewrite

# Configuration du répertoire de travail
WORKDIR /var/www/html

# Copie des fichiers de l'application
COPY . /var/www/html/

# Permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Variable d'environnement pour détecter Docker
ENV DOCKER_ENV=true

# Exposition du port 80
EXPOSE 80

# Démarrage d'Apache
CMD ["apache2-foreground"]
